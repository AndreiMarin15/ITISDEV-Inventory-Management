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

    addToInventory: (req, res) => {},

    getInventoryList: (req, res) => {},

    addSpoiled: (req, res) => {},

    addMissing: (req, res) => {},

    getDiscrepancy: (req, res) => {},

    // owner
    getDashboard: (req, res) => {},

    addMenuFolder: (req, res) => {},

    getMenu: (req, res) => {},

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
