const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware to connect frontend with backend
app.use(cors());
app.use(express.json());

/**
 *
 * ==============================
 * JWT Verification Function
 * 256bit encryption
 * ==============================
 *
 */

const verifyJWT = (req, res, next) => {
  const authenticationHeader = req.headers.authorization;
  if (!authenticationHeader) {
    return req.status(401).send({ message: "Unauthorized Access!" });
  }
  const token = authenticationHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access Forbidden!" });
    }
    req.decoded = decoded;
    next();
  });
};

/**
 *
 * ======================================
 *          MongoDB Configuration
 * ======================================
 *
 *
 */

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.58jrk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const machinesCollection = client
      .db("textileMachinesMart")
      .collection("products");
    console.log("db connected!");

    //   machines/products API
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = machinesCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    //   all products API Ends======

    // single product api starts here
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await machinesCollection.findOne(query);
      res.send(product);
    });

    // single product API ends here

    // update in UI and in DB
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      console.log(updatedQuantity);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateItem = {
        $set: {
          quantity: parseInt(updatedQuantity.quantity),
        },
      };
      const result = await machinesCollection.updateOne(
        query,
        updateItem,
        options
      );
      res.send(result);
    });

    //   add item API starts Here
    //   data will be added by user through this api to mongoDB
    app.post("/products", async (req, res) => {
      const userItem = req.body;
      const addedItem = await machinesCollection.insertOne(userItem);
      res.send(addedItem);
    });
    //   add item API Ends here

    // get item for individual
    app.get("/addedByUser", verifyJWT, async (req, res) => {
      console.log(req.query);
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = machinesCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({ message: "Access Forbidden!" });
      }
    });
    // get item for individual ends here

    // added by user product data change from frontend and delete from db and ui
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const removedItem = await machinesCollection.deleteOne(query);
      res.send(removedItem);
    });

    //JWT Authentication API
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.send({ accessToken });
    });
  } finally {
    //
  }
};
run().catch(console.dir);

/**
 * ============================================
 *
 *          MongoDB Config Ends Here
 *
 * ============================================
 *
 */

// root api
app.get("/", (req, res) => {
  res.send("Textile Machines' Mart Server is Running!");
});

app.listen(port, () => {
  console.log("Listening to port: ", port);
});
