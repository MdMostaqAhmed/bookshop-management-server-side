const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

//Use middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmos1oa.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://books:6ItrKtUGil18zL2j@cluster0.xmos1oa.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookShop').collection('books');

        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = bookCollection.find(query);
            const books = await cursor.toArray();
            res.send(books)
        })



    }
    finally { }

}
run().catch(console.dir)


app.get("/", (req, res) => {
    console.log("Server is working")
    res.send("Running bookshop server")
});

app.listen(port, () => {
    console.log("listening to port:", port);
})

