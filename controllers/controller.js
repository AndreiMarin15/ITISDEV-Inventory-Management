const db = require("../models/db");
const User = require("../models/User");
const Category = require("../models/Category");
const IngredientList = require("../models/ingredientList");
const Missing = require("../models/missing");
const OrderList = require("../models/OrderList");
const POS = require("../models/POS");
const Recipe = require("../models/recipe");
const Spoilage = require("../models/spoilage");
const TotalInventory = require("../models/totalInventory");
const Transactions = require("../models/transactions");
const Unit = require("../models/unit");
const UnitConversion = require("../models/unitConversion");
const UserType = require("../models/UserType");
const bcrypt = require("bcrypt");

const controller = {
    // checks if an admin account exists. If yes, it redirects to login. If not, creates an admin usertype and admin account
    getIndex: function (req, res) {
        db.findOne(User, { userType: 0 }, {}, (result) => {
            console.log("res = " + result);
            if (!result) {
                console.log("no result");
                let adminType = {
                    userID: 0,
                    userTypeDesc: "admin",
                };

                db.insertOne(UserType, adminType, (result) => {
                    console.log(result);

                    let invManagerType = {
                        userID: 1,
                        userTypeDesc: "Inventory Manager",
                    };

                    db.insertOne(UserType, invManagerType, (result) => {
                        console.log(result);

                        let cashierType = {
                            userID: 2,
                            userTypeDesc: "Cashier",
                        };

                        db.insertOne(UserType, cashierType, (result) => {
                            console.log(result);

                            let initialPassword = "00000000";
                            console.log(initialPassword);
                            bcrypt.hash(initialPassword, 10, (err, hash) => {
                                console.log(hash);
                                let adminUser = {
                                    userID: "admin",
                                    firstName: "N/A",
                                    lastName: "N/A",
                                    password: hash,
                                    userType: 0,
                                };

                                db.insertOne(User, adminUser, (result) => {
                                    console.log(result);
                                });
                            });
                        });
                    });
                });
            } else {
                console.log(result);
            }
        });

        res.render("login");
    },

    login: function (req, res) {
        let toLogin = {
            userID: req.body.username,
            password: req.body.password,
        };

        db.findOne(User, { userID: toLogin.userID }, {}, (user) => {
            if (user) {
                console.log("1 " + user);
                bcrypt.compare(toLogin.password, user.password).then((verify) => {
                    console.log("2 " + user);
                    if (verify) {
                        req.session.userIDs = user.userID;
                        req.session.firstName = user.firstName;
                        req.session.lastName = user.lastName;
                        req.session.userType = user.userType;

                        req.session.save();
                        console.log(req.session.userType);
                        res.redirect("/home");
                    }
                });
            }
        });
    },

    logout: function (req, res) {
        req.session.destroy((err) => {
            if (err) throw err;
            res.redirect("/login");
        });
    },

    home: function (req, res) {
        console.log(req.session);

        if (req.session.userType === 0) {
            db.findMany(User, { $or: [{ userType: 1 }, { userType: 2 }] }, {}, (users) => {
                db.findMany(UserType, { $or: [{ userID: 1 }, { userID: 2 }] }, {}, (userType) => {
                    let employee = [];
                    console.log(userType);

                    users.forEach((user) => {
                        let use = {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            userType: userType[user.userType - 1].userTypeDesc,
                        };

                        console.log(user);
                        console.log(use);

                        employee.push(use);
                    });
                    console.log(employee);
                    res.render("owner_dashboard", { Employee: employee });
                });
            });
        } else if (req.session.userType === 1) {
            res.render("invManager_createInventory");
        } else if (req.session.userType === 2) {
            res.render("cashier_POS");
        }
    },

    // cashier

    getMenu: (req, res) => {
        // function to get the menu list to be displayed
        // QUERY : Find ALL From recipe Where enables == true
        // send query to the front end as data (res.render)
    },

    checkout: (req, res) => {
        // Create new POS
        // Subtract ingredients
    },

    // inventory manager

    // inventorycreateCategory: (req, res) => {
    // add category using forms
    //},

    createItem: (req, res) => {
        // add item using forms
    },

    //   addToInventory: (req, res) => {},

    getInventoryList: (req, res) => {},

    addSpoiled: (req, res) => {},

    addMissing: (req, res) => {},

    getDiscrepancy: (req, res) => {},

    // owner
    getDashboard: function (req, res) {
        res.render("owner_dashboard");
    },

    getAddUser: function (req, res) {
        res.render("createUser");
    },

    addUser: function (req, res) {
        let firstName = req.body.newUserfirst;
        let lastName = req.body.newUserlast;
        let password = "00000000";
        let userID = req.body.assignedID;
        let userType = parseInt(req.body.employeetype);

        bcrypt.hash(password, 10, function (err, hash) {
            let newUser = {
                firstName: firstName,
                lastName: lastName,
                password: hash,
                userID: userID,
                userType: userType,
            };

            console.log(newUser);

            db.insertOne(User, newUser, (user) => {
                console.log("new user " + user);

                res.redirect("/home");
            });
        });
    },

    addMenuFolder: (req, res) => {},

    //   getMenu: (req, res) => {},

    getFolderItems: (req, res) => {},

    // newMenuItem: (req, res) => {},

    addMenuItem: (req, res) => {},

    getTodaysMenu: (req, res) => {},

    addTodaysMenu: (req, res) => {},

    getInventoryReports: (req, res) => {},

    getIngredients: (req, res) => {},

    //  addIngredient: (req, res) => {},

    getAuditTrail: (req, res) => {},

    viewInvoice: (req, res) => {},

    getTotalSale: (req, res) => {},

    getIngredientCost: (req, res) => {},

    //Testing HBS IF IT WORKS

    createUser: (req, res) => {
        res.render("createUser");
    },

    changePassword: (req, res) => {
        res.render("changePassword");
    },

    //cashier
    POS: (req, res) => {
        res.render("cashier_POS");
    },

    //invManager
    addToInventory: (req, res) => {
        res.render("invManager_addtoInventory");
    },

    createInventory: (req, res) => {
        res.render("invManager_createInventory");
    },

    inventoryList: (req, res) => {
        res.render("invManager_inventoryList");
    },

    missing: (req, res) => {
        res.render("invManager_missing");
    },

    missingResult: (req, res) => {
        res.render("invManager_missingResult");
    },

    spoilage: (req, res) => {
        res.render("invManager_spoilage");
    },

    transactionList: (req, res) => {
        res.render("invManager_transactionList");
    },

    createCategory: (req, res) => {
        res.render("invManager_createCategory");
    },

    //owner
    addIngredient: (req, res) => {
        res.render("owner_addIngredient");
    },

    dashboard: (req, res) => {
        res.render("owner_dashboard");
    },

    ingredients: (req, res) => {
        res.render("owner_ingredients");
    },

    mealCategory: (req, res) => {
        res.render("owner_mealCategory");
    },

    menuList: (req, res) => {
        res.render("owner_menuList");
    },

    newMenuItem: (req, res) => {
        res.render("owner_newMenuItem");
    },

    reportsPage: (req, res) => {
        res.render("owner_reportsPage");
    },

    todaysMenu: (req, res) => {
        res.render("owner_todaysMenu");
    },

    transTrail: (req, res) => {
        res.render("owner_transTrail");
    },

    invoice: (req, res) => {
        res.render("owner_invoice");
    },
    createFolder: (req, res) => {
        res.render("owner_createFolder");
    },
};

//testing for yana

module.exports = controller;
