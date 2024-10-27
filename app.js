//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const brcypt = require('bcrypt');
const saltRounds = 10;
// const md5 = require('md5');
// const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true
}));

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);


app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser) {
            if (brcypt.compareSync(password, foundUser.password)) {
                res.render("secrets");
            } else {
                res.send("Incorrect password.");
            }
        } else {
            res.send("No user found with that email.");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred.");
    }
});


app.get('/register', function(req, res) {
    res.render('register');
}); 

app.post("/register", async function(req, res) {
    try {
        const hash = await brcypt.hash(req.body.password, saltRounds);
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        
        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred during registration.");
    }
});

app.get('/compose', function(req, res) {
    res.render('compose');
}); 

app.get('/submit', function(req, res) {
    res.render('submit');
});








app.listen(3000, function() {
    console.log("Server started on port 3000");
});