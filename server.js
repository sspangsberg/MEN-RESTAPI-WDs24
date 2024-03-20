const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/auth")
const app = express()
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs')
const cors = require("cors");

require("dotenv-flow").config()

// CORS npm package
app.use(cors({
    "origin": "*"
}));

/*

app.use(function (req, res, next) {
    res.header("Acces-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
    next();
});
*/


app.use(bodyParser.json())

//setup Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.DBHOST,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).catch(error => console.log("Error connecting to MongoDB:" + error));

mongoose.connection.once("open", () => console.log("Connected succesfully to MongoDB"));


// route
app.get("/api/welcome", (req, res) => {
    res.status(200).send({ message: "Welcome to the MEN REST API" });
})

app.use("/api/products/", productRoutes);
app.use("/api/user/", userRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
    console.log("Server is running on port: " + PORT);
})


module.exports = app;