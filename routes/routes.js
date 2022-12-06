const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", controller.getIndex);


//Testing HBS IF IT WORKS
app.get("/cashier", (req, res) => {
    res.redirect("/cashierPOS");
});

app.get("/cashier", controller.cashierPage);

module.exports = app;
