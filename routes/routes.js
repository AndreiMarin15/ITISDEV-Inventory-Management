const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});
app.get("/login", controller.getIndex);

module.exports = app;
