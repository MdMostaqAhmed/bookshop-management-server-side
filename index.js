const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.get("/", (req, res) => {
    console.log("Server is working")
    res.send("Running bookshop server")
});

app.listen(port, () => {
    console.log("listening to port:", port);
})

