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

//Owner

app.get("/createNewUser", controller.getAddUser);
app.post("/addUser", controller.addUser);
app.get("/transactionTrail", controller.getTransactionTrail);
app.get("/ownerMenu", controller.getOwnerMenu);
app.get("/newFolder", controller.addMenuFolder);
app.get("/addIngredient", controller.addIngredient);
app.get("/newDish", controller.addMenuItem);
app.get("/recordFirstPurchase", controller.createItem);
app.get("/employeeList", controller.getEmployeeList);
app.get("/reportsPage", controller.getInventoryReports);
app.post("/addFolder", controller.addFolder);
app.get("/ownerInventoryList", controller.getOwnerInventoryList);
app.get("/deleteUser/:userID", controller.deleteUser);

// inventory manager
app.get("/inventoryList", controller.getInventoryList);
app.get("/createCategory", controller.getCreateCategory);
app.get("/createFoodGroup", controller.getFoodGroup);
app.get("/addInventory", controller.getAddInventory);
app.get("/inventorySpoiled", controller.getSpoilage);
app.get("/inventoryMissing", controller.getMissing);
app.get("/firstPurchase", controller.getCreateItem);
app.post("/addFoodGroup", controller.addFoodGroup);

// cashier
app.get("/viewPOS", controller.getPOS);

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
