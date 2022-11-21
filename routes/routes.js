const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

// app.get("/", (req, res) => {
//     res.redirect('/login')
// });
app.get("/login", (req,res) =>{
    res.render('login',{
        title: 'Restaurant',
        styles: ['login.css'],
    })
} );

module.exports = app;
