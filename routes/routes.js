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



//Owner

app.get("/createNewUser", controller.getAddUser);
app.post("/addUser", controller.addUser);
app.get("/transactionTrail", controller.getTransactionTrail);
app.get("/ownerMenu", controller.getOwnerMenu);
app.get("/newFolder", controller.addMenuFolder);
app.get("/addIngredient/:menugroupID/:recipeID", controller.addIngredient);
app.get("/newDish/:menugroupID", controller.addMenuItem);
app.get("/employeeList", controller.getEmployeeList);
app.get("/reportsPage", controller.getInventoryReports);
app.post("/addFolder", controller.addFolder);
app.get("/ownerInventoryList", controller.getOwnerInventoryList);
app.get("/deleteUser/:userID", controller.deleteUser);
app.get("/cancel", controller.cancelDish);
app.post("/submitDish/:menugroupID", controller.submitDish);
app.post("/ownerInventoryListFiltered", controller.getOwnerFiltered);
app.post("/employeeListFiltered", controller.getEmployeeFiltered);
app.post("/ownerReportsFiltered", controller.getInventoryReportsFiltered);
app.get("/viewRecipe/:recipeID", controller.viewIngredients);
app.post("/toggleStatus/:recipeID", controller.toggleIngredients);

// inventory manager
app.get("/inventoryList", controller.getInventoryList);
app.get("/createCategory", controller.getCreateCategory);
app.get("/createFoodGroup", controller.getFoodGroup);
app.get("/recordPurchase", controller.getRecordPurchase);
app.get("/inventorySpoiled", controller.getSpoilage);
app.get("/inventoryMissing/:id", controller.getMissing);
app.post("/submitMissing/:id", controller.submitMissing);
app.get("/firstPurchase", controller.getCreateItem);
app.post("/addFoodGroup", controller.addFoodGroup);
app.post("/newCategory", controller.addCategory);
app.post("/addFirstPurchase", controller.firstPurchase);
app.post("/additionalPurchase", controller.recordPurchase);
app.get("/reportsPageinvManager", controller.getReportsPageInvManager);
app.post("/submitSpoilage", controller.submitSpoilage);
app.post("/inventoryListFiltered", controller.getFiltered);
app.post("/reportsPageInvManagerFiltered", controller.getReportsInvManagerFiltered);

// cashier
app.get("/viewPOS/:menugroupID", controller.getPOS);
app.post("/submitPOS", controller.submitPOS);


module.exports = app;
