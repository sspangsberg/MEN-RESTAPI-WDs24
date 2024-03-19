const router = require("express").Router();
const User = require("../models/user");
const { registerValidation, loginValidation } = require("../validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// registration
router.post("/register", async (req, res) => {
    // validate the user and password
    const { error } = registerValidation(req.body);

    if (error) {
        console.log("Validation failed");
        return res.status(400).json({ error: error.details[0].message });
    }
    
        
    // check if the email is already registered
    const emailExist = await User.findOne({ email: req.body.email });

    if (emailExist) {
        console.log("Email exists");
        return res.status(400).json({ error: "Email already exists. "});
    }


    // has the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    //console.log("Salt: " + salt);
    //console.log("Pass: " + password);


    // create a user object and save in the DB
    const userObject = new User( {
        name: req.body.name,
        email: req.body.email,
        password
    });

    try {
        const savedUser = await userObject.save();
        res.json( { error: null, data: savedUser._id });

    } catch (error) {
        res.status(400).json( { error } );
    }
});


// login
router.post("/login", async (req, res) => {
    //

    // validate user login inf
    const { error } = loginValidation(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    // if login info is valid, find the user
    const user = await User.findOne({ email: req.body.email });


    // throw error if email is wrong (user does not exist in DB)
    if (!user) {
        return res.status(400).json({ error: "Email is wrong. "});
    }

    // user exist - check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    // throw error if password is wrong
    if (!validPassword)
        return res.status(400).json({ error: "Password is wrong. "});

    // create authentication token with username and id
    const token = jwt.sign( 
        // payload
        {
            name: user.name,
            id: user._id,
            extra_data: "test"
        },
        // TOKEN_SECRET,
        process.env.TOKEN_SECRET,
        // EXPIRATION
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // attach auth token to header
    res.header("auth-token", token).json( { 
        error: null,
        data: { token }
    })
});

module.exports = router;