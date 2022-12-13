const db = require("../models/db");
const User = require("../models/User");
const Category = require("../models/Category");
const IngredientList = require("../models/ingredientList");
const Missing = require("../models/missing");
const OrderList = require("../models/orderList");
const POS = require("../models/POS");
const Recipe = require("../models/recipe");
const Spoilage = require("../models/spoilage");
const TotalInventory = require("../models/totalInventory");
const Transactions = require("../models/transactions");
const Unit = require("../models/unit");
const UnitConversion = require("../models/unitConversion");
const UserType = require("../models/UserType");
const bcrypt = require("bcrypt");
const FoodGroup = require("../models/foodGroup");
const MenuGroup = require("../models/menuGroup");
const Ingredients = require("../models/ingredients");
const moment = require("moment");


const controller = {
    // checks if an admin account exists. If yes, it redirects to login. If not, creates an admin usertype and admin account
    getIndex: function (req, res) {
        if (req.session.userID == null) {
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
        } else {
            res.redirect("/home");
        }
    },

    login: function (req, res) {
        let toLogin = {
            userID: req.body.userID,
            password: req.body.password,
        };

        db.findOne(User, { userID: toLogin.userID }, {}, (user) => {
            if (user) {
                console.log("1 " + user);
                bcrypt.compare(toLogin.password, user.password).then((verify) => {
                    console.log("2 " + user);
                    if (verify) {
                        req.session.id = user._id;
                        req.session.userID = user.userID;
                        req.session.firstName = user.firstName;
                        req.session.lastName = user.lastName;
                        req.session.userType = user.userType;
                        req.session.password = user.password;

                        req.session.save();
                        console.log(req.session.userType);
                        res.redirect("/home");
                    } else {
                        res.send(
                            `<script>alert("Invalid user credentials."); window.location.href = "/login"; </script>`
                        );
                    }
                });
            } else {
                res.send(
                    `<script>alert("Invalid user credentials."); window.location.href = "/login"; </script>`
                );
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
                            empID: user.userID,
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
            db.findOne(UserType, { userID: req.session.userType }, {}, (type) => {
                let Emp = {
                    firstName: req.session.firstName,
                    lastName: req.session.lastName,
                    userType: type.userTypeDesc,
                    userID: req.session.userID,
                };
                res.render("invManager_Dashboard", { Emp: Emp });
            });
        } else if (req.session.userType === 2) {
            db.findOne(UserType, { userID: req.session.userType }, {}, (type) => {
                let Emp = {
                    firstName: req.session.firstName,
                    lastName: req.session.lastName,
                    userType: type.userTypeDesc,
                    userID: req.session.userID,
                };
                res.render("cashier_Dashboard", { Emp: Emp });
            });
        }
    },
    getChangePassword: function (req, res) {
        res.render("changePassword");
    },
    changePassword: function (req, res) {
        db.findOne(User, { userID: req.session.userID }, {}, (user) => {
            let oldPassword = req.body.oldPass;
            let newPassword = req.body.newPass;
            let confPassword = req.body.confirmPass;

            bcrypt.compare(oldPassword, req.session.password).then((verify) => {
                if (verify) {
                    if (newPassword == confPassword) {
                        bcrypt.hash(newPassword, 10, function (err, hash) {
                            user.password = hash;

                            user.save().then(() => {
                                res.send(
                                    `<script>alert("Password changed."); window.location.href = "/home"; </script>`
                                );
                            });
                        });
                    } else {
                        res.send(
                            `<script>alert("New Password don't match. Please try again"); window.location.href = "/changePassword"; </script>`
                        );
                    }
                } else {
                    res.send(
                        `<script>alert("Old Password don't match. Please try again"); window.location.href = "/changePassword"; </script>`
                    );
                }
            });
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

    getPOS: (req, res) => {
        res.render("cashier_POS");
    },

    // inventory manager

    // inventorycreateCategory: (req, res) => {
    // add category using forms
    //},

    

    //   addToInventory: (req, res) => {},

    getInventoryList: (req, res) => {
        res.render("invManager_inventoryList");
    },

    getCreateCategory: async (req, res) => {
        try {
            await db.findMany(FoodGroup, {}, {}, (groups) => {
                let foodGroup = [];
                console.log(groups);
                groups.forEach((group) => {
                    let food = {
                        foodGroupID: group.foodGroupID,
                        foodGroupName: group.foodGroupName,
                    };

                    console.log(food);

                    foodGroup.push(food);
                });

                db.findMany(Unit, {}, {}, (units) => {
                    res.render("invManager_createCategory", { foodGroup: foodGroup, unit: units });
                });

                
            });
        } catch (err) {
            console.log(err);
        }
    },

    getCreateItem: async (req, res) => {
        try {
            db.findMany(Unit, {}, {}, (units) => {
                
                if(units.length == 0){
                    let initialUnits = [
                        {
                            unitID: 1,
                            unitName: "kg",
                        }, 
                        {
                            unitID: 2,
                            unitName: "L",
                        },
                        {
                            unitID: 3,
                            unitName: "pcs",
                        }, 
                    ];
    
                    db.insertMany(Unit, initialUnits, (result) => {
                        console.log(result);
                    })
                    
                    db.findMany(Category, {}, {}, categories => {
                     
                        res.render("invManager_recordFirstPurchase", {unit: units, category:categories});
                    })
                    
                } else {
                    db.findMany(Category, {}, {}, categories => {
                  
                        res.render("invManager_recordFirstPurchase", {unit: units, category:categories});
                    })
                 
                }
            });
        } catch (err) {
            console.log(err);
        }
    },

    addFoodGroup: async (req, res) => {
        let name = req.body.foldername;

        await db.findMany(FoodGroup, {}, {}, (foodgroups) => {
            if (foodgroups.length > 0) {
                let id = 1;

                foodgroups.forEach((foodgroup) => {
                    if (foodgroup.foodGroupID >= id) {
                        id = foodgroup.foodGroupID + 1;
                    }
                });

                let group = {
                    foodGroupID: id,
                    foodGroupName: name,
                };

                db.insertOne(FoodGroup, group, (result) => {
                    console.log(result);
                });

                res.send(
                    `<script>alert("Food Group Created."); window.location.href = "/firstPurchase"; </script>`
                );
            } else {
                let id = 1;

                let group = {
                    foodGroupID: id,
                    foodGroupName: name,
                };

                db.insertOne(FoodGroup, group, (result) => {
                    console.log(result);
                });

                res.send(
                    `<script>alert("Food Group Created."); window.location.href = "/firstPurchase"; </script>`
                );
            }
        });
    },

    addCategory: async (req, res) => {
      await db.findMany(Category, {}, {}, (categories) => {
        if (categories.length == 0){
            
            let newCategory = {
                categoryID: 1,
                categoryName: req.body.categoryname,
                foodGroupID: parseInt(req.body.foodgroup),
                runningTotal: 0,
                unitID: req.body.netunit,
            }
         
           
            db.insertOne(Category, newCategory, result => {
                console.log(result);
                res.redirect("/firstPurchase");
            })
            
        } else {
            let maxID = Math.max.apply(null, categories.map((categ) => {
                return categ.categoryID;
            }));

            let newCategory = {
                categoryID: maxID + 1,
                categoryName: req.body.categoryname,
                foodGroupID: req.body.foodgroup,
                runningTotal: 0,
                unitID: req.body.netunit,
            }
            db.insertOne(Category, newCategory, result => {
                console.log(result);
                res.redirect("/firstPurchase");
            })
            
        }
      });
    },

    firstPurchace: async (req, res) => {
        await db.findMany(Ingredients, {}, {}, ingredients => {
            if(ingredients.length == 0){
                db.findOne(Unit, {unitID: parseInt(req.body.netunit) },{}, (unit) => {
                    let newIngredient = {
                        ingredientID: 1,
                        ingredientName: req.body.itemname,
                        netWeight: parseFloat(req.body.netweight),
                        unitMeasure: unit.unitName,
                        categoryID: req.body.category,
                    };

                    db.findOne(Category, {categoryID: newIngredient.categoryID}, {}, (category) => {

                            db.insertOne(Ingredients, newIngredient, result => {
                                console.log(result);
                                res.redirect("/recordPurchase");
                            });
                        
                        
                    })
                   

                })
            } else {
                db.findOne(Unit, {unitID: parseInt(req.body.netunit) }, {}, (unit) =>{
                    let maxID = Math.max.apply(null, ingredients.map((ing) => {
                        return ing.ingredientID;
                    }));
                    let newIngredient = {
                        ingredientID: maxID + 1,
                        ingredientName: req.body.itemname,
                        netWeight: parseFloat(req.body.netweight),
                        unitMeasure: unit.unitName,
                        categoryID: req.body.category,
                    };

                    db.findOne(Category, {categoryID: newIngredient.categoryID}, {}, (category) => {

               

                      
                            db.insertOne(Ingredients, newIngredient, result => {
                                console.log(result);
                                res.redirect("/recordPurchase");
                            });
                      
                        
                    })
    
                    
                })
            }
        })
    },

    getRecordPurchase: (req, res) => {

        db.findMany(Ingredients, {}, {}, (ingredients) => {
            res.render("invManager_recordPurchase", {ingredient: ingredients});
        })
        // Ingredient
        // yung ingredient, ichecheck ano ang net weight and anong category, quantity will be multiplied with net weight
        // punta sa category
        // uupdate ang running total = current total + quantity * netweight
    },

    recordPurchase: async (req, res) => {
        await db.findOne(Ingredients, {ingredientID: req.body.itemname}, {}, (ingredient) => {
            db.findOne(Category, {categoryID: ingredient.categoryID}, {}, (category) => {
                let currentTotal = ingredient.netWeight * req.body.quantity;

                let newTotal = category.runningTotal + currentTotal;

                db.updateOne(Category, {categoryID: category.categoryID}, {runningTotal: newTotal}, result => {
                    db.findMany(Transactions, {}, {}, transactions => {
                        
                        let date = new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth(), new Date(Date.now()).getDate())
                        
                        console.log("date today: " + date); 
                        if(transactions.length == 0){

                            let transaction = {
                                transactionID: 1,
                                ingredientID: req.body.itemname,
                                quantity: req.body.quantity,
                                buyDate: date
                            }

                            db.insertOne(Transactions, transaction, trans => {
                                console.log(trans);
                                res.send(
                                    `<script>alert("Transaction Recorded."); window.location.href = "/recordPurchase"; </script>`
                                );

                            })
                        } else {
                            let maxID = Math.max.apply(null, transactions.map((transact) => {
                                return transact.transactionID;
                            }));
                            let transaction = {
                                transactionID: maxID + 1,
                                ingredientID: req.body.itemname,
                                quantity: req.body.quantity,
                                buyDate: date
                            }

                            db.insertOne(Transactions, transaction, trans => {
                                console.log(trans);
                                res.send(
                                    `<script>alert("Transaction Recorded."); window.location.href = "/recordPurchase"; </script>`
                                );

                            })
                        }
                    })
                })
            });
        });
    },

    getSpoilage: async (req, res) => {
        await db.findMany(Category, {}, {}, (items) => {
            db.findMany(Unit, {}, {}, units => {
                let item = [];
                items.forEach(it => {
                    let instance = {
                        categoryID: it.categoryID,
                        categoryName: it.categoryName,
                        unitName: units[it.unitID - 1].unitName,
                    }

                    item.push(instance)
                })

                res.render("invManager_spoilage", {item: item});
            })
            
        });

        
    },

    submitSpoilage: async(req, res) => {
        db.findMany(Spoilage, {}, {}, spoiled => {
            if(spoiled.length == 0) {
                db.findOne(Category, {categoryID: req.body.itemName}, {}, category => {
                    let date = new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth(), new Date(Date.now()).getDate())
                    let spoil = {
                        caseID: 1,
                        categoryID: req.body.itemName,
                        employeeNo: req.session.userID,
                        amount: parseFloat(req.body.quantity),
                        unitID: category.unitID,
                        date: date,
                    }
                    if(category.runningTotal - parseFloat(req.body.quantity) >= 0){
                    db.insertOne(Spoilage, spoil, spo => {
                        console.log(spo);
                        
                            db.updateOne(Category, {categoryID: category.categoryID}, {runningTotal: category.runningTotal - parseFloat(req.body.quantity)}, updated => {
                                res.send(
                                    `<script>alert("Spoilage Recorded."); window.location.href = "/home"; </script>`
                                );
                            })
                        
                        
                    })
                } else {
                    res.send(
                        `<script>alert("Spoilage report more than existing inventory."); window.location.href = "/inventorySpoiled"; </script>`
                    );
                }
                })
            } else {
                db.findOne(Category, {categoryID: req.body.itemName}, {}, category => {
                    let maxID = Math.max.apply(null, spoiled.map((spoi) => {
                        return spoi.caseID;
                    }));
                    let date = new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth(), new Date(Date.now()).getDate())
                    let spoil = {
                        caseID: maxID + 1,
                        categoryID: req.body.itemName,
                        employeeNo: req.session.userID,
                        amount: parseFloat(req.body.quantity),
                        unitID: category.unitID,
                        date: date,
                    }
                    if(category.runningTotal - parseFloat(req.body.quantity) >= 0){
                    db.insertOne(Spoilage, spoil, spo => {
                        console.log(spo);

                        
                            db.updateOne(Category, {categoryID: category.categoryID}, {runningTotal: category.runningTotal - parseFloat(req.body.quantity)}, updated => {
                            res.send(
                                `<script>alert("Spoilage Recorded."); window.location.href = "/home"; </script>`
                            );
                        })

                        
                        
                    })
                } else {
                    res.send(
                        `<script>alert("Spoilage report more than existing inventory."); window.location.href = "/inventorySpoiled"; </script>`
                    );
                }


                })
            }
        })
    },

    getMissing: (req, res) => {
        res.render("invManager_missing");
    },


    // owner
    getDashboard: function (req, res) {
        res.render("owner_dashboard");
    },

    getOwnerInventoryList: (req, res) => {
        res.render("owner_inventoryList");
    },

    getEmployeeList: function (req, res) {
        db.findMany(User, { $or: [{ userType: 1 }, { userType: 2 }] }, {}, (users) => {
            db.findMany(UserType, { $or: [{ userID: 1 }, { userID: 2 }] }, {}, (userType) => {
                let employee = [];
                

                users.forEach((user) => {
                    let use = {
                        userID: user.userID,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        position: userType[user.userType - 1].userTypeDesc,
                    };

                 

                    employee.push(use);
                });
               
                res.render("owner_employeeList", { employee: employee });
            });
        });
    },

    deleteUser: async (req, res) => {
        console.log(req.params.userID);
        await db.delOne(User, {userID: req.params.userID}, (user) => {
            console.log("deleted" + user);

            res.redirect(req.get('referer'));
        });
    },

    getAddUser: function (req, res) {
        // User.find({ userID: { $not: "admin" } })

        User.find({ userID: { $ne: "admin" } }).then((users) => {
            console.log(users);
            if (users) {
                console.log("if");
                let maxID = 00001;
                users.forEach((user) => {
                    let id = parseInt(user.userID);

                    if (maxID < id) {
                        maxID = id;
                        console.log(maxID);
                    }
                });
                console.log("before: " + maxID);

                let newID = "0000" + (maxID + 1).toString();
                console.log(newID);
                res.render("createUser", { empID: newID });
            } else {
                console.log("else");
                res.render("createUser", { empID: "00001" });
            }
        });
    },

    addUser: function (req, res) {
        let firstName = req.body.newUserfirst;
        let lastName = req.body.newUserlast;
        let password = req.body.newUserPassword;
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

    getTransactionTrail: function (req, res) {
        res.render("owner_transTrail");
    },

    getOwnerMenu: function (req, res) {
        res.render("owner_menuList");
    },

    addMenuFolder: (req, res) => {
        res.render("owner_createFolder");
    },

    addFolder: async (req, res) => {
        let folderName = req.body.foldername;
        console.log(req.body.foldername);
        await db.findMany(MenuGroup, {}, {}, (menugroups) => {
            if (menugroups.length > 0) {
                let id = 1;

                menugroups.forEach((menugroup) => {
                    if (menugroup.menuGroupID >= id) {
                        id = menugroup.menuGroupID + 1;
                    }

                    console.log(id);
                });

                let group = {
                    menuGroupID: id,
                    menuGroupName: folderName,
                };

                db.insertOne(MenuGroup, group, (result) => {
                    console.log(result);
                });

                res.send(
                    `<script>alert("Menu Group Created."); window.location.href = "/ownerMenu"; </script>`
                );
            } else {
                let id = 1;

                let group = {
                    menuGroupID: id,
                    menuGroupName: folderName,
                };

                db.insertOne(MenuGroup, group, (result) => {
                    console.log(result);
                });

                res.send(
                    `<script>alert("Menu Group Created."); window.location.href = "/ownerMenu"; </script>`
                );
            }
        });
    },

    //   getMenu: (req, res) => {},



    // newMenuItem: (req, res) => {},

    addMenuItem: (req, res) => {
        res.render("owner_newDish");
    },

    getFoodGroup: (req, res) => {
        res.render("invManager_createFoodGroup");
    },


    getInventoryReports: (req, res) => {
        res.render("owner_reportsPage");
    },



    addIngredient: (req, res) => {
        res.render("owner_addIngredient");
    },


    //Testing HBS IF IT WORKS
    /*
    createUser: (req, res) => {
        res.render("createUser");
    },

    //cashier
    POS: (req, res) => {
        res.render("cashier_POS");
    },

    getcashierDashboard: (req, res) => {
        res.render("cashier_dashboard");
    },

    //invManager
    getinvManagerDashboard: (req, res) => {
        res.render("invManager_dashboard");
    },

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

    getownerDashboard: (req, res) => {
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
    }, */
};

//testing for yana

module.exports = controller;
