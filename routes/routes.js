const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", controller.getIndex);
app.post("/proceedLogin", controller.login);


//Testing HBS IF IT WORKS

app.get("/createUser", controller.createUser);
app.get("/changePassword", controller.changePassword);

//Cashier
app.get("/POS", controller.POS);

//invManager
app.get("/addtoInventory", controller.addToInventory);
app.get("/createInventory", controller.createInventory);
app.get("/inventoryList", controller.inventoryList);
app.get("/missing", controller.missing);
app.get("/missingResult", controller.missingResult);
app.get("/spoilage", controller.spoilage);
app.get("/transactionList", controller.transactionList);
app.get("/createCategory", controller.createCategory);

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
app.get("/invoice", controller.invoice);
app.get("/createFolder", controller.createFolder);

module.exports = app;
