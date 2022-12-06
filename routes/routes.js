const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", controller.getIndex);


//Testing HBS IF IT WORKS

//Cashier
app.get("/POS", controller.POS);

//invManager
app.get("/todaysMenu", controller.todaysMenu);

//Owner


module.exports = app;
