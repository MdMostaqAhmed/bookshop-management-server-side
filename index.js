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

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmos1oa.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://books:6ItrKtUGil18zL2j@cluster0.xmos1oa.mongodb.net/?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3qafz9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookShop').collection('books');

        // Load six products for home page
        app.get('/limitedBooks', async (req, res) => {
            const query = {};
            const cursor = bookCollection.find(query);
            const books = await (await cursor.toArray()).slice(0, 6);
            res.send(books)
        })

        //Load all products
        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = bookCollection.find(query);
            const books = await (await cursor.toArray());
            res.send(books)
        })

        // Load specific product detail by id
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await bookCollection.findOne(query);
            res.send(result);
        })

        // Load specific product detail by email
        app.get('/myItem', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = bookCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Delete item by registered user
        app.delete('/myItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };

            const result = await bookCollection.deleteOne(query);
            res.send(result);
        })



        // Add a single item
        app.post('/book', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.send(result);
        })

        // Update specific item
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const updateBook = req.body;
            const query = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateBook.name,
                    img: updateBook.img,
                    description: updateBook.description,
                    price: updateBook.price,
                    supplier: updateBook.supplier,
                    available: updateBook.available,
                    sold: updateBook.sold
                },
            };
            const result = await bookCollection.updateOne(query, updateDoc, options);
            res.send(result)

        })

        // Update delivered and instock 
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            const updateBook = req.body;
            const query = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    available: updateBook.available,
                    sold: updateBook.sold
                },
            };
            const result = await bookCollection.updateOne(query, updateDoc, options);
            res.send(result)

        })

        // Delete a product
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

