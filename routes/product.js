const router = require("express").Router();
const product = require("../models/product");
const { verifyToken } = require("../validation");

// CRUD operations
// Create product - post

router.post("/", verifyToken, (req, res) => {
    /* 	#swagger.tags = ['POST Routes']
        #swagger.description = 'Route that creates a new product'

        #swagger.requestBody = {
            required: true,
            schema: { $ref: "#/components/schemas/Product" }
        }

        #swagger.security = [{
            "apiKeyAuth": []
        }] 
    */
    let data = req.body;

    product.insertMany(data)
        .then(data => { res.send(data); })
        .catch(err => { res.status(500).send({ message: err.message }); })
});





// Read all products - get
router.get("/", (req, res) => {
    product.find()
        .then(data => { res.send(data); })
        .catch(err => { res.status(500).send({ message: err.message }); })
})

//Read random document
router.get("/random", (req, res) => {
    // Get number of all documents in collection
    product.countDocuments({})
        .then(count => {

            // Get a random number
            let random = Math.floor(Math.random() * count);

            // Query all documents, but skip (fetch) only one with the offset of "random"
            product.findOne().skip(random)
                .then(data => {
                    res.send(data)
                })
                .catch(err => {
                    res.status(500).send({ message: err.message })
                })
        })
});


//
//
//
// 
//Read all documents based on variable field and value
router.get("/:field/:value", (request, response) => {

    const field = request.params.field;
    const value = request.params.value;

    product.find({ [field]: { $regex: request.params.value, $options: 'i' } })
        .then(data => { response.send(data) })
        .catch(err => {
            response.status(500).send({ message: err.message })
        })
});


// Read all products currently in stock - get
router.get("/instock", (req, res) => {

    product.find({ inStock: true })
        .then(data => { res.send(data); })
        .catch(err => { res.status(500).send({ message: err.message }); })
})

// Read specific product - get
// Read all products - get
router.get("/:id", (req, res) => {

    product.findById(req.params.id)
        .then(data => { res.send(data); })
        .catch(err => { res.status(500).send({ message: err.message }); })
})

// Update specific product - put
router.put("/:id", verifyToken, (req, res) => {

    const id = req.params.id;

    product.findByIdAndUpdate(id, req.body)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Cannot update product with id=" + id + ". Maybe product was not found." });
            }
            else {
                res.send({ message: "Product was succesfully updated." });
            }
        })
        .catch(err => { res.status(500).send({ message: "Error updating product with id=" + id }); })
})

// Delete specific product - delete
router.delete("/:id", verifyToken, (req, res) => {

    const id = req.params.id;

    product.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Cannot delete product with id=" + id + ". Maybe product was not found." });
            }
            else {
                res.send({ message: "Product was succesfully deleted." });
            }
        })
        .catch(err => { res.status(500).send({ message: "Error delete product with id=" + id }); })
})




module.exports = router;