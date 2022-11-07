const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

//Use middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmos1oa.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get("/", (req, res) => {
    console.log("Server is working")
    res.send("Running bookshop server")
});

app.listen(port, () => {
    console.log("listening to port:", port);
})

