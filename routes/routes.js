const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", controller.getIndex);
app.post("/login", controller.login);

module.exports = app;
