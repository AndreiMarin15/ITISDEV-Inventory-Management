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


//Owner
app.get("/addIngredient", controller.addIngredient);
app.get("/dashboard", controller.dashboard);
app.get("/ingredients", controller.ingredients);
app.get("/mealCategory", controller.mealCategory);
app.get("/menuList", controller.menuList);
app.get("/newMenuItem", controller.newMenuItem);
app.get("/reportsPage", controller.reportsPage);
app.get("/todaysMenu", controller.todaysMenu);
app.get("/transTrail", controller.transTrail);

module.exports = app;
