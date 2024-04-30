const router = require("express").Router();
const User = require("../models/user");
const { registerValidation, loginValidation, verifyRefresh } = require("../validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// registration
router.post("/register", async (req, res) => {
    // validate the user and password
    const { error } = registerValidation(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }


    // check if the email is already registered
    const emailExist = await User.findOne({ email: req.body.email });

    if (emailExist) {
        return res.status(400).json({ error: "Email already exists. " });
    }

    // has the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    //console.log("Salt: " + salt);
    //console.log("Pass: " + password);

    // create a user object and save in the DB
    const userObject = new User({
        name: req.body.name,
        email: req.body.email,
        password
    });

    try {
        const savedUser = await userObject.save();
        res.json({ error: null, data: savedUser._id });

    } catch (error) {
        res.status(400).json({ error });
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
        return res.status(400).json({ error: "Invalid Email or Password." });
    }

    // user exist - check for password correctness
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    // throw error if password is wrong
    if (!validPassword)
        return res.status(400).json({ error: "Invalid Email or Password." });

    // create authentication token with username and email
    const accessToken = jwt.sign(
        //const token = jwt.sign(
        // payload
        {
            name: user.name,
            email: user.email,
            type: 'access' // optional type info
        },
        // TOKEN_SECRET,
        process.env.TOKEN_SECRET,
        // EXPIRATION
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 3
    //create refresh token with username and email
    const refreshToken = jwt.sign(
        //payload
        {
            name: user.name,
            email: user.email,
            type: 'refresh' // optional type info
        },
        //TOKEN_SECRET
        process.env.TOKEN_SECRET,

        //EXPIRATION TIME
        { expiresIn: '24h' },
    );

    //attach auth token to header
    res.header("auth-token", accessToken).json({
        error: null,
        data: { accessToken, refreshToken }
    });


});

// 2
// Refresh token route 
// This allows the client to request a new access token without requiring the user to do a full login
router.post("/refresh", async (req, res) => {
    const { email, refreshToken } = req.body;
    const isValid = verifyRefresh(email, refreshToken);
    if (!isValid) {
        return res.status(401).json({ success: false, error: "Invalid token,try login again" });
    }

    // if email and refresh token is valid, find the user
    const user = await User.findOne({ email: req.body.email });

    const accessToken = jwt.sign(
        {
            name: user.name,
            email: user.email,
            type: 'access'
        },
        // TOKEN_SECRET,
        process.env.TOKEN_SECRET,
        // EXPIRATION
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return res.status(200).json({ success: true, accessToken });
});


module.exports = router;