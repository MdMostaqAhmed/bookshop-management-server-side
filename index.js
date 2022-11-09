const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const objectId = require("mongodb").ObjectId;

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

        app.post('/book', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.send(result);
        })

        app.put('/book', async (req, res) => {
            const id = req.params.id;
            const updateBook = req.body;
            const query = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateBook.name,
                    img: updateBook.img,
                    price: updateBook.price,
                    supplier: updateBook.supplier,
                    available: updateBook.available,
                    sold: updateBook.sold
                },
            };
            const result = await bookCollection.updateOne(query, updateDoc, options);
            res.send(result)

        })

        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await bookCollection.deleteOne(query);
            res.send(result);
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

