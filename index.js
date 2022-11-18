const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const objectId = require("mongodb").ObjectId;

//Use middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    };
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded:', decoded)
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3qafz9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bookCollection = client.db('bookShop').collection('books');

        //Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken })
        })

        // Load six products for home page
        app.get('/limitedBooks', async (req, res) => {
            const query = {};
            const cursor = bookCollection.find(query);
            const books = await cursor.limit(6).toArray();
            res.send(books)
        });

        //Load all products
        app.get('/books', async (req, res) => {
            // const query = {};
            // const cursor = bookCollection.find(query);
            // const books = await cursor.toArray();
            // res.send(books)
            console.log("query:", req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = bookCollection.find(query);
            let products;
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray()
            } else {
                products = await cursor.toArray()
            }
            res.send(products)
        });

        // Load Data for count
        app.get('/bookCount', async (req, res) => {
            const count = await bookCollection.estimatedDocumentCount();
            res.send({ count })
        });



        // Load specific product detail by id
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await bookCollection.findOne(query);
            res.send(result);
        });

        // Load specific product detail by email
        app.get('/myItem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = bookCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
        });

        // Delete item by registered user
        app.delete('/myItem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };

            const result = await bookCollection.deleteOne(query);
            res.send(result);
        });



        // Add a single item
        app.post('/book', async (req, res) => {
            const newBook = req.body;
            const result = await bookCollection.insertOne(newBook);
            res.send(result);
        });

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
        });

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
        });

        // Delete a product
        app.delete('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) };
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally { }

}
run().catch(console.dir);


app.get("/", (req, res) => {
    console.log("Server is working")
    res.send("Running bookshop server")
});

app.listen(port, () => {
    console.log("listening to port:", port);
})

