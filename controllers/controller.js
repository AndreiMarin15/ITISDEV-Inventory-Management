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

const controller = {
    getIndex: (req, res) => {
        res.render("login");
    },

    login: (req, res) => {
        // function for logging in
        // use bcrypt only when finalized account creation
    },

    // cashier

    getMenu: (req, res) => {
        // function to get the menu list to be displayed
    },

    checkout: (req, res) => {},

    // inventory manager

    createCategory: (req, res) => {},

    createItem: (req, res) => {},

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
    todaysMenu: (req, res) => {
        res.render("owner_todaysMenu");
    },

    
};

module.exports = controller;
