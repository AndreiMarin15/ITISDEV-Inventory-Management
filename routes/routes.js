const express = require(`express`);
const app = express();
const controller = require("../controllers/controller");

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", controller.getIndex);
app.post("/proceedLogin", controller.login);
app.get("/home", controller.home);
app.post("/newUser", controller.addUser);
app.get("/logout", controller.logout);
app.get("/changePassword", controller.getChangePassword);
app.post("/updatePassword", controller.changePassword);

//Testing HBS IF IT WORKS

app.get("/createUser", controller.createUser);


//Cashier
/*
app.get("/POS", controller.POS);
app.get("/invManagerDashboard", controller.getinvManagerDashboard);

//invManager
app.get("/cashierDashboard", controller.getcashierDashboard);
app.get("/addtoInventory", controller.addToInventory);
app.get("/createInventory", controller.createInventory);
app.get("/inventoryList", controller.inventoryList);
app.get("/missing", controller.missing);
app.get("/missingResult", controller.missingResult);
app.get("/spoilage", controller.spoilage);
app.get("/transactionList", controller.transactionList);
app.get("/createCategory", controller.createCategory);

//Owner
app.get("/ownerDashboard", controller.getownerDashboard);
app.get("/createNewUser", controller.getAddUser);
app.post("/addUser", controller.addUser);

app.get("/addIngredient", controller.addIngredient);

app.get("/ingredients", controller.ingredients);
app.get("/mealCategory", controller.mealCategory);
app.get("/menuList", controller.menuList);
app.get("/newMenuItem", controller.newMenuItem);
app.get("/reportsPage", controller.reportsPage);
app.get("/todaysMenu", controller.todaysMenu);
app.get("/transTrail", controller.transTrail);
app.get("/invoice", controller.invoice);
app.get("/createFolder", controller.createFolder);
*/
module.exports = app;
