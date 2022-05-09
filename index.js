const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware to connect frontend with backend
app.use(cors());
app.use(express.json());

/**
 * ======================================
 *          MongoDB Configuration
 * ======================================
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

    //   add item API starts Here
    //   data will be added by user through this api to mongoDB
    app.post("/addItem", async (req, res) => {
      const userItem = req.body;
      const addedItem = await machinesCollection(userItem);
      res.send(addedItem);
    });
    //   add item API Ends here
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
