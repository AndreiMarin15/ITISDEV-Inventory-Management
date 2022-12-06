const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", controller.getIndex);


//Testing HBS IF IT WORKS
app.get("/POS", controller.POS);

app.get("/todaysMenu", controller.todaysMenu);

module.exports = app;
