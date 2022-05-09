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

const { MongoClient, ServerApiVersion } = require("mongodb");
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

    //   machines API
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = machinesCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  } finally {
    //
  }
};
run().catch(console.dir);

// ==============MongoDB Config Ends================

// root api
app.get("/", (req, res) => {
  res.send("Textile Machines' Mart Server is Running!");
});

app.listen(port, () => {
  console.log("Listening to port: ", port);
});
