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
    getIndex: (req, res) => {
        db.findOne(User, {}, {}, (result) => {
            console.log("res = " + result);
            if (!result) {
                console.log("no result");
                let adminType = {
                    userID: 0,
                    userTypeDesc: "admin",
                };

                db.insertOne(UserType, adminType, (result) => {
                    console.log(result);

                    let initialPassword = "00000000";
                    console.log(initialPassword);
                    bcrypt.hash(initialPassword, 10, (err, hash) => {
                        console.log(hash);
                        let adminUser = {
                            userID: "admin",
                            password: hash,
                            userType: 0,
                        };

                        db.insertOne(User, adminUser, (result) => {
                            console.log(result);
                        });
                    });
                });
            }
        });

        res.render("login");
    },

    login: (req, res) => {
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

                        if (req.session.userType == 0) {
                            res.render("owner_dashboard");
                        }
                    }
                });
            }
        });
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

    createCategory: (req, res) => {
        // add category using forms
    },

    createItem: (req, res) => {
        // add item using forms
    },

    //   addToInventory: (req, res) => {},

    getInventoryList: (req, res) => {},

    addSpoiled: (req, res) => {},

    addMissing: (req, res) => {},

    getDiscrepancy: (req, res) => {},

    // owner
    getDashboard: (req, res) => {},

    addMenuFolder: (req, res) => {},

    //   getMenu: (req, res) => {},

    getFolderItems: (req, res) => {},

    newMenuItem: (req, res) => {},

    addMenuItem: (req, res) => {},

    getTodaysMenu: (req, res) => {},

    addTodaysMenu: (req, res) => {},

    getInventoryReports: (req, res) => {},

    getIngredients: (req, res) => {},

    addIngredient: (req, res) => {},

    getAuditTrail: (req, res) => {},

    viewInvoice: (req, res) => {},

    getTotalSale: (req, res) => {},

    getIngredientCost: (req, res) => {},

    //Testing HBS IF IT WORKS

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
};

module.exports = controller;
