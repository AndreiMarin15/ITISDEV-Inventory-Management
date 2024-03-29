const db = require("../models/db");
const User = require("../models/User");
const Category = require("../models/Category");
const IngredientList = require("../models/ingredientList");
const Missing = require("../models/missing");
const OrderList = require("../models/orderList");
const Pos = require("../models/POS");
const Recipe = require("../models/recipe");
const Spoilage = require("../models/spoilage");
const Transactions = require("../models/transactions");
const Unit = require("../models/unit");
const UserType = require("../models/UserType");
const bcrypt = require("bcrypt");
const FoodGroup = require("../models/foodGroup");
const MenuGroup = require("../models/menuGroup");
const Ingredients = require("../models/ingredients");
const { raw } = require("body-parser");

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
						res.send(`<script>alert("Invalid user credentials."); window.location.href = "/login"; </script>`);
					}
				});
			} else {
				res.send(`<script>alert("Invalid user credentials."); window.location.href = "/login"; </script>`);
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
					db.findMany(Category, {}, {}, (categories) => {
						db.findMany(FoodGroup, {}, {}, (foodgroups) => {
							db.findMany(Unit, {}, {}, (units) => {
								let employee = [];

								users.forEach((user) => {
									let use = {
										empID: user.userID,
										firstName: user.firstName,
										lastName: user.lastName,
										userType: userType[user.userType - 1].userTypeDesc,
									};

									employee.push(use);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let h = date.getHours();
								let m = date.getMinutes();

								let ampm = h >= 12 ? "PM" : "AM";
								h = h % 12;
								h = h ? h : 12; // the hour '0' should be '12'
								m = m < 10 ? "0" + m : m;

								let time = h + ":" + m + " " + ampm;
								let fullDate = month + "-" + day + "-" + year + ", " + time;

								let toCategory = [];
								let toStock = [];

								categories.forEach((category) => {
									let toPushCateg = {
										categoryName: category.categoryName,
										foodGroupName: foodgroups.find((fgrp) => fgrp.foodGroupID == category.foodGroupID).foodGroupName,
										runningTotal: category.runningTotal,
										unitName: units.find((unt) => unt.unitID == category.unitID).unitName,
									};
									let toPushStock = {
										categoryName: category.categoryName,
										runningTotal: category.runningTotal,
										unitName: units.find((unt) => unt.unitID == category.unitID).unitName,
									};

									toCategory.push(toPushCateg);
									toStock.push(toPushStock);
								});

								toStock.sort((a, b) => {
									let da = a.runningTotal,
										db = b.runningTotal;

									return da - db;
								});

								let stockPass = [];

								for (let i = 0; i < 12; i++) {
									if (toStock[i] != null) {
										stockPass.push(toStock[i]);
									}
								}

								res.render("owner_dashboard", {
									Employee: employee,
									dateToday: fullDate,
									Category: toCategory, // category name, foodgroup name, running total, unitname
									stock: stockPass, // 12 only, running total and category name
								});
							});
						});
					});
				});
			});
		} else if (req.session.userType === 1) {
			db.findOne(UserType, { userID: req.session.userType }, {}, (type) => {
				db.findMany(Category, {}, {}, (categories) => {
					db.findMany(FoodGroup, {}, {}, (foodgroups) => {
						db.findMany(Unit, {}, {}, (units) => {
							let Emp = {
								firstName: req.session.firstName,
								lastName: req.session.lastName,
								userType: type.userTypeDesc,
								userID: req.session.userID,
							};

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let h = date.getHours();
							let m = date.getMinutes();

							let ampm = h >= 12 ? "PM" : "AM";
							h = h % 12;
							h = h ? h : 12; // the hour '0' should be '12'
							m = m < 10 ? "0" + m : m;

							let time = h + ":" + m + " " + ampm;

							let fullDate = month + "-" + day + "-" + year + ", " + time;

							let toCategory = [];
							let toStock = [];

							categories.forEach((category) => {
								let toPushCateg = {
									categoryName: category.categoryName,
									foodGroupName: foodgroups.find((fgrp) => fgrp.foodGroupID == category.foodGroupID).foodGroupName,
									runningTotal: category.runningTotal,
									unitName: units.find((unt) => unt.unitID == category.unitID).unitName,
								};
								let toPushStock = {
									categoryName: category.categoryName,
									runningTotal: category.runningTotal,
									unitName: units.find((unt) => unt.unitID == category.unitID).unitName,
								};

								toCategory.push(toPushCateg);
								toStock.push(toPushStock);
							});

							toStock.sort((a, b) => {
								let da = a.runningTotal,
									db = b.runningTotal;

								return da - db;
							});

							let stockPass = [];

							for (let i = 0; i < 12; i++) {
								if (toStock[i] != null) {
									stockPass.push(toStock[i]);
								}
							}

							res.render("invManager_Dashboard", {
								Emp: Emp,
								dateToday: fullDate,
								Category: toCategory,
								stock: stockPass,
							});
						});
					});
				});
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
								res.send(`<script>alert("Password changed."); window.location.href = "/home"; </script>`);
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

	getPOS: (req, res) => {
		db.findMany(MenuGroup, {}, {}, (menugroups) => {
			db.findOne(MenuGroup, { menuGroupID: req.params.menugroupID }, {}, (active) => {
				db.findMany(Recipe, { menuGroupID: active.menuGroupID, enabled: true }, {}, (recipes) => {
					console.log(recipes);
					res.render("cashier_POS", { menugroup: menugroups, Recipe: recipes });
				});
			});
		});
	},
	// let maxID = Math.max.apply(
	//	null,
	//	ingredients.map((ing) => {
	//		return ing.ingredientID;
	//	})

	// submit
	// rerecord POS
	// rerecord OrderList

	// check recipeID
	// sa recipe checheck ingredient list
	// makukuha ingredient ni recipe
	// may sarili syang amount
	// amount ni ingredient list imultiply sa quantity
	// kunin category ni ingredient
	// ibabawas sa running total

	submitPOS: async (req, res) => {
		let recipes = req.body.recipe;
		let quantity = req.body.quantity;

		let orders = [];
		console.log("recipes " + recipes);
		console.log("quantity " + quantity);

		for (let i = 0; i < recipes.length; i++) {
			let toPush = {
				recipe: recipes[i],
				quanity: quantity[i],
			};

			orders.push(toPush);
		}

		await db.findMany(Pos, {}, {}, (pos) => {
			db.findMany(Category, {}, {}, (categories) => {
				if (pos.length == 0) {
					let maxID = 1;
					let toInsert = {
						POSIDno: maxID,
						dateOfOrder: new Date(Date.now()),
						idPersonInCharge: req.session.userID,
					};

					db.insertOne(Pos, toInsert, (inserted) => {
						db.findMany(OrderList, {}, {}, (orderlists) => {
							if (orderlists.length == 0) {
								let orderID = 1;
								orders.forEach((order) => {
									let toOrder = {
										orderListID: orderID,
										POSIDno: toInsert.POSIDno,
										recipeID: order.recipe,
										quantity: order.quanity,
									};
									db.insertOne(OrderList, toOrder, (inserted) => {
										db.findMany(IngredientList, { recipeID: toOrder.recipeID }, {}, (ingredients) => {
											// ingredients ng recipes sa mga inorder

											ingredients.forEach((ingredient) => {
												let toSubtract = toOrder.quantity * ingredient.amount;
												let subtracted =
													categories.find((categ) => categ.categoryID == ingredient.categoryID).runningTotal -
													toSubtract;

												db.updateOne(
													Category,
													{ categoryID: ingredient.categoryID },
													{ runningTotal: subtracted },
													(updated) => {}
												);
											});
										});
									});
									orderID++;
								});
							} else {
								let orderID = Math.max.apply(
									null,
									orderlists.map((ord) => {
										return ord.orderListID;
									})
								);
								orders.forEach((order) => {
									let toOrder = {
										orderListID: orderID + 1,
										POSIDno: toInsert.POSIDno,
										recipeID: order.recipe,
										quantity: order.quanity,
									};
									db.insertOne(OrderList, toOrder, (inserted) => {
										db.findMany(IngredientList, { recipeID: toOrder.recipeID }, {}, (ingredients) => {
											// ingredients ng recipes sa mga inorder

											ingredients.forEach((ingredient) => {
												let toSubtract = toOrder.quantity * ingredient.amount;
												let subtracted =
													categories.find((categ) => categ.categoryID == ingredient.categoryID).runningTotal -
													toSubtract;

													db.updateOne(
														Category,
														{ categoryID: ingredient.categoryID },
														{ runningTotal: subtracted },
														(updated) => {}
													);
											});
										});
									});
									orderID++;
								});
							}
						});
					});
				} else {
					let maxID = Math.max.apply(
						null,
						pos.map((p) => {
							return p.POSIDno;
						})
					);

					let toInsert = {
						POSIDno: maxID,
						dateOfOrder: new Date(Date.now()),
						idPersonInCharge: req.session.userID,
					};

					db.insertOne(Pos, toInsert, (inserted) => {
						db.findMany(OrderList, {}, {}, (orderlists) => {
							if (orderlists.length == 0) {
								let orderID = 1;
								orders.forEach((order) => {
									let toOrder = {
										orderListID: orderID,
										POSIDno: toInsert.POSIDno,
										recipeID: order.recipe,
										quantity: order.quanity,
									};
									db.insertOne(OrderList, toOrder, (inserted) => {
										db.findMany(IngredientList, { recipeID: toOrder.recipeID }, {}, (ingredients) => {
											// ingredients ng recipes sa mga inorder

											ingredients.forEach((ingredient) => {
												let toSubtract = toOrder.quantity * ingredient.amount;
												let subtracted =
													categories.find((categ) => categ.categoryID == ingredient.categoryID).runningTotal -
													toSubtract;

													db.updateOne(
														Category,
														{ categoryID: ingredient.categoryID },
														{ runningTotal: subtracted },
														(updated) => {}
													);
											});
										});
									});
									orderID++;
								});
							} else {
								let orderID = Math.max.apply(
									null,
									orderlists.map((ord) => {
										return ord.orderListID;
									})
								);
								orders.forEach((order) => {
									let toOrder = {
										orderListID: orderID + 1,
										POSIDno: toInsert.POSIDno,
										recipeID: order.recipe,
										quantity: order.quanity,
									};
									db.insertOne(OrderList, toOrder, (inserted) => {
										db.findMany(IngredientList, { recipeID: toOrder.recipeID }, {}, (ingredients) => {
											// ingredients ng recipes sa mga inorder

											ingredients.forEach((ingredient) => {
												let toSubtract = toOrder.quantity * ingredient.amount;
												let subtracted =
													categories.find((categ) => categ.categoryID == ingredient.categoryID).runningTotal -
													toSubtract;

													db.updateOne(
														Category,
														{ categoryID: ingredient.categoryID },
														{ runningTotal: subtracted },
														(updated) => {}
													);
											});
										});
									});
									orderID++;
								});
							}
						});
					});
				}
			});
		});
		res.redirect("/viewPOS/1");
	},

	// inventory manager

	// inventorycreateCategory: (req, res) => {
	// add category using forms
	//},

	getReportsPageInvManager: async (req, res) => {
		let report = [];

		await db.findMany(Category, {}, {}, (categories) => {
			db.findMany(User, { userID: { $ne: "admin" } }, {}, (users) => {
				db.findMany(Spoilage, {}, {}, (spoilage) => {
					spoilage.forEach((spoiled) => {
						let spoiledPush = {
							caseDate: spoiled.caseDate,
							reportType: "Spoilage",
							CategoryName: categories.find((categ) => categ.categoryID === parseInt(spoiled.categoryID)).categoryName,
							amount: spoiled.amount,
							employeeName:
								users.find((user) => user.userID === spoiled.employeeNo).firstName +
								" " +
								users.find((user) => user.userID === spoiled.employeeNo).lastName,
						};

						report.push(spoiledPush);
					});
					db.findMany(Missing, {}, {}, (missing) => {
						missing.forEach((miss) => {
							let missingPush = {
								caseDate: miss.caseDate,
								reportType: "Missing",
								CategoryName: categories.find((categ) => categ.categoryID === parseInt(miss.categoryID)).categoryName,
								amount: miss.amount,
								employeeName:
									users.find((user) => user.userID === miss.employeeNo).firstName +
									" " +
									users.find((user) => user.userID === miss.employeeNo).lastName,
							};
							report.push(missingPush);
						});
						report.sort((a, b) => {
							let da = new Date(a.caseDate),
								db = new Date(b.caseDate);

							return db - da;
						});

						let date = new Date(Date.now());
						let month = date.getMonth() + 1;
						let day = date.getDate();
						let year = date.getFullYear();

						let fullDate = month + "-" + day + "-" + year;

						res.render("invManager_reportsPage", {
							Report: report,
							dateToday: fullDate,
						});
					});
				});
			});
		});
	},

	getReportsInvManagerFiltered: async (req, res) => {
		let report = [];
		await db.findMany(Category, {}, {}, (categories) => {
			db.findMany(User, { userID: { $ne: "admin" } }, {}, (users) => {
				db.findMany(Spoilage, {}, {}, (spoilage) => {
					spoilage.forEach((spoiled) => {
						let spoiledPush = {
							caseDate: spoiled.caseDate,
							reportType: "Spoilage",
							CategoryName: categories.find((categ) => categ.categoryID === parseInt(spoiled.categoryID)).categoryName,
							amount: spoiled.amount,
							employeeName:
								users.find((user) => user.userID === spoiled.employeeNo).firstName +
								" " +
								users.find((user) => user.userID === spoiled.employeeNo).lastName,
						};

						report.push(spoiledPush);
					});
					db.findMany(Missing, {}, {}, (missing) => {
						missing.forEach((miss) => {
							let missingPush = {
								caseDate: miss.caseDate,
								reportType: "Missing",
								CategoryName: categories.find((categ) => categ.categoryID === parseInt(miss.categoryID)).categoryName,
								amount: miss.amount,
								employeeName:
									users.find((user) => user.userID === miss.employeeNo).firstName +
									" " +
									users.find((user) => user.userID === miss.employeeNo).lastName,
							};
							report.push(missingPush);
						});

						if (req.body.filter == 1) {
							if (req.body.sort == 1) {
								report.sort((a, b) => {
									let da = new Date(a.caseDate),
										db = new Date(b.caseDate);
									// Date Descending
									return db - da;
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("invManager_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							} else if (req.body.sort == 2) {
								report.sort((a, b) => {
									let da = new Date(a.caseDate),
										db = new Date(b.caseDate);
									// Date Ascending
									return da - db;
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("invManager_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							}
						} else {
							if (req.body.sort == 1) {
								report.sort((a, b) => {
									let ra = a.employeeName,
										rb = b.employeeName;
									//employee name ascending
									return ra.localeCompare(rb);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("invManager_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							} else if (req.body.sort == 2) {
								report.sort((a, b) => {
									let ra = a.employeeName,
										rb = b.employeeName;
									//employee name descending
									return rb.localeCompare(ra);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("invManager_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							}
						}
					});
				});
			});
		});
	},

	addIngredient: async (req, res) => {
		await db.findOne(MenuGroup, { menuGroupID: req.params.menugroupID }, {}, (menugroup) => {
			db.findOne(Recipe, { recipeID: req.params.recipeID }, {}, (recipe) => {
				db.findMany(Category, {}, {}, (categories) => {
					db.findMany(Unit, {}, {}, (units) => {
						let toPass = [];

						categories.forEach((category) => {
							let toPush = {
								categoryID: category.categoryID,
								categoryName: category.categoryName,
								unitName: units.find((unit) => unit.unitID == category.unitID).unitName,
							};

							toPass.push(toPush);
						});

						res.render("owner_addIngredient", {
							recipe: recipe,
							menugroup: menugroup,
							Category: toPass,
						});
					});
				});
			});
		});
	},
	//   addToInventory: (req, res) => {},

	getInventoryList: (req, res) => {
		db.findMany(Category, {}, {}, (categories) => {
			db.findMany(FoodGroup, {}, {}, (foodgroups) => {
				console.log(foodgroups);
				db.findMany(Unit, {}, {}, (units) => {
					let toPass = [];
					categories.forEach((category) => {
						let toPush = {
							categoryName: category.categoryName,
							foodGroupName: foodgroups[category.foodGroupID - 1].foodGroupName,
							runningTotal: category.runningTotal.toFixed(2),
							unitName: units[category.unitID - 1].unitName,
						};
						console.log(toPush);
						toPass.push(toPush);
					});

					toPass.sort((a, b) => {
						let ca = a.categoryName,
							cb = b.categoryName;

						return ca.localeCompare(cb);
					});

					let date = new Date(Date.now());
					let month = date.getMonth() + 1;
					let day = date.getDate();
					let year = date.getFullYear();

					let fullDate = month + "-" + day + "-" + year;

					res.render("invManager_inventoryList", {
						details: toPass,
						dateToday: fullDate,
					});
				});
			});
		});
	},

	getFiltered: async (req, res) => {
		db.findMany(Category, {}, {}, (categories) => {
			db.findMany(FoodGroup, {}, {}, (foodgroups) => {
				console.log(foodgroups);
				db.findMany(Unit, {}, {}, (units) => {
					let toPass = [];
					categories.forEach((category) => {
						let toPush = {
							categoryName: category.categoryName,
							foodGroupName: foodgroups[category.foodGroupID - 1].foodGroupName,
							runningTotal: category.runningTotal.toFixed(2),
							unitName: units[category.unitID - 1].unitName,
						};
						console.log(toPush);
						toPass.push(toPush);
					});

					if (req.body.filter == 1) {
						if (req.body.sort == 1) {
							toPass.sort((a, b) => {
								// by category ascending
								let ca = a.categoryName,
									cb = b.categoryName;

								return ca.localeCompare(cb);
							});
							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("invManager_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						} else if (req.body.sort == 2) {
							toPass.sort((a, b) => {
								// by category descending
								let ca = a.categoryName,
									cb = b.categoryName;

								return cb.localeCompare(ca);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("invManager_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						}
					} else {
						if (req.body.sort == 1) {
							toPass.sort((a, b) => {
								// by foodgroup ascending
								let ca = a.foodGroupName,
									cb = b.foodGroupName;

								return ca.localeCompare(cb);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("invManager_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						} else if (req.body.sort == 2) {
							toPass.sort((a, b) => {
								// by foodgroup descending
								let ca = a.foodGroupName,
									cb = b.foodGroupName;

								return cb.localeCompare(ca);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("invManager_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						}
					}
				});
			});
		});
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
					res.render("invManager_createCategory", {
						foodGroup: foodGroup,
						unit: units,
					});
				});
			});
		} catch (err) {
			console.log(err);
		}
	},

	getCreateItem: async (req, res) => {
		try {
			db.findMany(Unit, {}, {}, (units) => {
				if (units.length == 0) {
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
					});

					db.findMany(Category, {}, {}, (categories) => {
						res.render("invManager_recordFirstPurchase", {
							unit: units,
							category: categories,
						});
					});
				} else {
					db.findMany(Category, {}, {}, (categories) => {
						res.render("invManager_recordFirstPurchase", {
							unit: units,
							category: categories,
						});
					});
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

				res.send(`<script>alert("Food Group Created."); window.location.href = "/firstPurchase"; </script>`);
			} else {
				let id = 1;

				let group = {
					foodGroupID: id,
					foodGroupName: name,
				};

				db.insertOne(FoodGroup, group, (result) => {
					console.log(result);
				});

				res.send(`<script>alert("Food Group Created."); window.location.href = "/firstPurchase"; </script>`);
			}
		});
	},

	addCategory: async (req, res) => {
		await db.findMany(Category, {}, {}, (categories) => {
			if (categories.length == 0) {
				let newCategory = {
					categoryID: 1,
					categoryName: req.body.categoryname,
					foodGroupID: parseInt(req.body.foodgroup),
					runningTotal: 0,
					unitID: req.body.netunit,
				};

				db.insertOne(Category, newCategory, (result) => {
					console.log(result);
					res.redirect("/firstPurchase");
				});
			} else {
				let maxID = Math.max.apply(
					null,
					categories.map((categ) => {
						return categ.categoryID;
					})
				);

				let newCategory = {
					categoryID: maxID + 1,
					categoryName: req.body.categoryname,
					foodGroupID: req.body.foodgroup,
					runningTotal: 0,
					unitID: req.body.netunit,
				};
				db.insertOne(Category, newCategory, (result) => {
					console.log(result);
					res.redirect("/firstPurchase");
				});
			}
		});
	},

	firstPurchase: async (req, res) => {
		await db.findMany(Ingredients, {}, {}, (ingredients) => {
			if (ingredients.length == 0) {
				db.findOne(Unit, { unitID: parseInt(req.body.netunit) }, {}, (unit) => {
					let newIngredient = {
						ingredientID: 1,
						ingredientName: req.body.itemname,
						netWeight: parseFloat(req.body.netweight),
						unitMeasure: unit.unitName,
						categoryID: req.body.category,
					};

					db.findOne(Category, { categoryID: newIngredient.categoryID }, {}, (category) => {
						db.insertOne(Ingredients, newIngredient, (result) => {
							console.log(result);
							res.redirect("/recordPurchase");
						});
					});
				});
			} else {
				db.findOne(Unit, { unitID: parseInt(req.body.netunit) }, {}, (unit) => {
					let maxID = Math.max.apply(
						null,
						ingredients.map((ing) => {
							return ing.ingredientID;
						})
					);
					let newIngredient = {
						ingredientID: maxID + 1,
						ingredientName: req.body.itemname,
						netWeight: parseFloat(req.body.netweight),
						unitMeasure: unit.unitName,
						categoryID: req.body.category,
					};

					db.findOne(Category, { categoryID: newIngredient.categoryID }, {}, (category) => {
						db.insertOne(Ingredients, newIngredient, (result) => {
							console.log(result);
							res.redirect("/recordPurchase");
						});
					});
				});
			}
		});
	},

	getRecordPurchase: (req, res) => {
		db.findMany(Ingredients, {}, {}, (ingredients) => {
			res.render("invManager_recordPurchase", { ingredient: ingredients });
		});
		// Ingredient
		// yung ingredient, ichecheck ano ang net weight and anong category, quantity will be multiplied with net weight
		// punta sa category
		// uupdate ang running total = current total + quantity * netweight
	},

	recordPurchase: async (req, res) => {
		await db.findOne(Ingredients, { ingredientID: req.body.itemname }, {}, (ingredient) => {
			db.findOne(Category, { categoryID: ingredient.categoryID }, {}, (category) => {
				let currentTotal = ingredient.netWeight * req.body.quantity;

				let newTotal = category.runningTotal + currentTotal;

				db.updateOne(Category, { categoryID: category.categoryID }, { runningTotal: newTotal }, (result) => {
					db.findMany(Transactions, {}, {}, (transactions) => {
						let date = new Date(
							new Date(Date.now()).getFullYear(),
							new Date(Date.now()).getMonth(),
							new Date(Date.now()).getDate()
						);

						console.log("date today: " + date);
						if (transactions.length == 0) {
							let transaction = {
								transactionID: 1,
								ingredientID: req.body.itemname,
								quantity: req.body.quantity,
								buyDate: date,
							};

							db.insertOne(Transactions, transaction, (trans) => {
								console.log(trans);
								res.send(`<script>alert("Transaction Recorded."); window.location.href = "/recordPurchase"; </script>`);
							});
						} else {
							let maxID = Math.max.apply(
								null,
								transactions.map((transact) => {
									return transact.transactionID;
								})
							);
							let transaction = {
								transactionID: maxID + 1,
								ingredientID: req.body.itemname,
								quantity: req.body.quantity,
								buyDate: date,
							};

							db.insertOne(Transactions, transaction, (trans) => {
								console.log(trans);
								res.send(`<script>alert("Transaction Recorded."); window.location.href = "/recordPurchase"; </script>`);
							});
						}
					});
				});
			});
		});
	},

	getSpoilage: async (req, res) => {
		await db.findMany(Category, {}, {}, (items) => {
			db.findMany(Unit, {}, {}, (units) => {
				let item = [];
				items.forEach((it) => {
					let instance = {
						categoryID: it.categoryID,
						categoryName: it.categoryName,
						unitName: units[it.unitID - 1].unitName,
					};

					item.push(instance);
				});

				res.render("invManager_spoilage", { item: item });
			});
		});
	},

	submitSpoilage: async (req, res) => {
		db.findMany(Spoilage, {}, {}, (spoiled) => {
			if (spoiled.length == 0) {
				db.findOne(Category, { categoryID: req.body.itemName }, {}, (category) => {
					let date = new Date(Date.now());
					let spoil = {
						caseID: 1,
						categoryID: req.body.itemName,
						employeeNo: req.session.userID,
						amount: parseFloat(req.body.quantity),
						unitID: category.unitID,
						caseDate: date,
					};
					if (category.runningTotal - parseFloat(req.body.quantity) >= 0) {
						db.insertOne(Spoilage, spoil, (spo) => {
							console.log(spo);

							db.updateOne(
								Category,
								{ categoryID: category.categoryID },
								{
									runningTotal: category.runningTotal - parseFloat(req.body.quantity),
								},
								(updated) => {
									res.send(`<script>alert("Spoilage Recorded."); window.location.href = "/home"; </script>`);
								}
							);
						});
					} else {
						res.send(
							`<script>alert("Spoilage report more than existing inventory."); window.location.href = "/inventorySpoiled"; </script>`
						);
					}
				});
			} else {
				db.findOne(Category, { categoryID: req.body.itemName }, {}, (category) => {
					let maxID = Math.max.apply(
						null,
						spoiled.map((spoi) => {
							return spoi.caseID;
						})
					);
					let date = new Date(Date.now());
					let spoil = {
						caseID: maxID + 1,
						categoryID: req.body.itemName,
						employeeNo: req.session.userID,
						amount: parseFloat(req.body.quantity),
						unitID: category.unitID,
						caseDate: date,
					};
					if (category.runningTotal - parseFloat(req.body.quantity) >= 0) {
						db.insertOne(Spoilage, spoil, (spo) => {
							console.log(spo);

							db.updateOne(
								Category,
								{ categoryID: category.categoryID },
								{
									runningTotal: category.runningTotal - parseFloat(req.body.quantity),
								},
								(updated) => {
									res.send(`<script>alert("Spoilage Recorded."); window.location.href = "/home"; </script>`);
								}
							);
						});
					} else {
						res.send(
							`<script>alert("Spoilage report more than existing inventory."); window.location.href = "/inventorySpoiled"; </script>`
						);
					}
				});
			}
		});
	},

	getMissing: (req, res) => {
		db.findOne(FoodGroup, { foodGroupID: req.params.id }, {}, (foodgroup) => {
			db.findMany(FoodGroup, {}, {}, (fgroups) => {
				db.findMany(Category, { foodGroupID: req.params.id }, {}, (categories) => {
					let categoryIDs = [];
					categories.forEach((categ) => {
						categoryIDs.push(categ.categoryID);
					});

					db.findMany(Ingredients, { categoryID: { $in: categoryIDs } }, {}, (ingredients) => {
						let ingred = [];
						ingredients.forEach((ingredient) => {
							let toPush = {
								categoryName: categories.find((categ) => categ.categoryID === ingredient.categoryID).categoryName,
								ingredientName: ingredient.ingredientName,
								ingredientID: ingredient.ingredientID,
								categoryID: categories.find((categ) => categ.categoryID === ingredient.categoryID).categoryID,
							};

							ingred.push(toPush);
						});

						let date = new Date(Date.now());
						let month = date.getMonth() + 1;
						let day = date.getDate();
						let year = date.getFullYear();

						res.render("invManager_missing", {
							foodGroupID: foodgroup.foodGroupID,
							foodGroupName: foodgroup.foodGroupName,
							foodGroup: fgroups,
							Ingredient: ingred,
							dateToday: month + "-" + day + "-" + year,
						});
					});
				});
			});
		});

		// get their individual counts
		// multiply to net weight
		// i total ang count * netweight of each ingredient for each category
		// icompare sa running total (running total - total count = discrepancy)
	},
	// categoryName: categories.find(categ => categ.categoryID === ingredient.categoryID ).categoryName
	submitMissing: async (req, res) => {
		if(req.body.categoryIDs.length > 1){
			let categoryIDs = req.body.categoryIDs.map(Number);
		let ingredientIDs = req.body.ingredientIDs.map(Number);
		let physicalCounts = req.body.physical;
		let ingredientCount = [];
		let i;

		for (i = 0; i < physicalCounts.length; i++) {
			let toPush = {
				categoryID: categoryIDs[i],
				ingredientID: ingredientIDs[i],
				physicalCount: parseFloat(physicalCounts[i]),
			};

			ingredientCount.push(toPush);
		}
		db.findMany(Ingredients, { ingredientID: { $in: ingredientIDs } }, {}, (ingredients) => {
			let toHBS = [];
			let withNetweight = [];
			ingredientCount.forEach((count) => {
				// add netweight ng mga same category

				let netweights = {
					categoryID: count.categoryID,
					ingredientID: count.ingredientID,
					netweight:
						ingredients.find((ingred) => ingred.ingredientID == count.ingredientID).netWeight * count.physicalCount,
				};

				withNetweight.push(netweights);
			});

			db.findMany(Category, { categoryID: { $in: categoryIDs } }, {}, (categories) => {
				let toPass = [];
				categories.forEach((category) => {
					let toPush = {
						categoryID: category.categoryID,
						categoryName: category.categoryName,
						runningTotal: category.runningTotal,
						physicalCount: 0.0,
						amount: 0.0,
					};

					for (let i = 0; i < withNetweight.length; i++) {
						if (category.categoryID == withNetweight[i].categoryID) {
							toPush.physicalCount = toPush.physicalCount + withNetweight[i].netweight;
							toPush.amount = Math.abs(toPush.runningTotal - toPush.physicalCount);
						}
					}
					toPass.push(toPush);
					// maxID = Math.max.apply(null, recipes.map((rec) => {
					//        return rec.recipeID;
					//        }));
					if (category.runningTotal > toPush.physicalCount) {
						db.findMany(Missing, {}, {}, (missings) => {
							if (missings.length == 0) {
								let date = new Date(Date.now());
								let toInsert = {
									caseID: "1",
									categoryID: category.categoryID,
									employeeNo: req.session.userID,
									amount: toPush.amount,
									unitID: category.unitID,
									caseDate: date,
								};
								console.log(toInsert);
								db.insertOne(Missing, toInsert, (inserted) => {
									console.log(inserted);
									db.updateOne(
										Category,
										{ categoryID: category.categoryID },
										{ runningTotal: toPush.physicalCount },
										(updated) => {
											console.log(updated);
										}
									);
								});
							} else {
								let date = new Date(Date.now());
								let maxID = Math.max.apply(
									null,
									missings.map((miss) => {
										return miss.caseID;
									})
								);
								let toInsert = {
									caseID: (maxID + 1).toString(),
									categoryID: category.categoryID,
									employeeNo: req.session.userID,
									amount: toPush.amount,
									unitID: category.unitID,
									caseDate: date,
								};
								console.log(toInsert);
								db.insertOne(Missing, toInsert, (inserted) => {
									console.log(inserted);
									db.updateOne(
										Category,
										{ categoryID: category.categoryID },
										{ runningTotal: toPush.physicalCount },
										(updated) => {
											console.log(updated);
										}
									);
								});
							}
						});
					} else {
						db.updateOne(
							Category,
							{ categoryID: category.categoryID },
							{ runningTotal: toPush.physicalCount },
							(updated) => {
								console.log(updated + "no insert");
							}
						);
					}
				});
				// change running total of the category with the manual count running total
				// record discrepancy in missing

				res.render("invManager_missingResult", { Missing: toPass });
			});
		});
		} else {
			let categoryIDs = req.body.categoryIDs;
			let ingredientIDs = req.body.ingredientIDs;
			let physicalCounts = req.body.physical;
			let ingredientCount = [];
			let i;
	
			for (i = 0; i < physicalCounts.length; i++) {
				let toPush = {
					categoryID: categoryIDs[i],
					ingredientID: ingredientIDs[i],
					physicalCount: parseFloat(physicalCounts[i]),
				};
	
				ingredientCount.push(toPush);
			}
			db.findMany(Ingredients, { ingredientID: { $in: ingredientIDs } }, {}, (ingredients) => {
				let toHBS = [];
				let withNetweight = [];
				ingredientCount.forEach((count) => {
					// add netweight ng mga same category
	
					let netweights = {
						categoryID: count.categoryID,
						ingredientID: count.ingredientID,
						netweight:
							ingredients.find((ingred) => ingred.ingredientID == count.ingredientID).netWeight * count.physicalCount,
					};
	
					withNetweight.push(netweights);
				});
	
				db.findMany(Category, { categoryID: { $in: categoryIDs } }, {}, (categories) => {
					let toPass = [];
					categories.forEach((category) => {
						let toPush = {
							categoryID: category.categoryID,
							categoryName: category.categoryName,
							runningTotal: category.runningTotal,
							physicalCount: 0.0,
							amount: 0.0,
						};
	
						for (let i = 0; i < withNetweight.length; i++) {
							if (category.categoryID == withNetweight[i].categoryID) {
								toPush.physicalCount = toPush.physicalCount + withNetweight[i].netweight;
								toPush.amount = Math.abs(toPush.runningTotal - toPush.physicalCount);
							}
						}
						toPass.push(toPush);
						// maxID = Math.max.apply(null, recipes.map((rec) => {
						//        return rec.recipeID;
						//        }));
						if (category.runningTotal > toPush.physicalCount) {
							db.findMany(Missing, {}, {}, (missings) => {
								if (missings.length == 0) {
									let date = new Date(Date.now());
									let toInsert = {
										caseID: "1",
										categoryID: category.categoryID,
										employeeNo: req.session.userID,
										amount: toPush.amount,
										unitID: category.unitID,
										caseDate: date,
									};
									console.log(toInsert);
									db.insertOne(Missing, toInsert, (inserted) => {
										console.log(inserted);
										db.updateOne(
											Category,
											{ categoryID: category.categoryID },
											{ runningTotal: toPush.physicalCount },
											(updated) => {
												console.log(updated);
											}
										);
									});
								} else {
									let date = new Date(Date.now());
									let maxID = Math.max.apply(
										null,
										missings.map((miss) => {
											return miss.caseID;
										})
									);
									let toInsert = {
										caseID: (maxID + 1).toString(),
										categoryID: category.categoryID,
										employeeNo: req.session.userID,
										amount: toPush.amount,
										unitID: category.unitID,
										caseDate: date,
									};
									console.log(toInsert);
									db.insertOne(Missing, toInsert, (inserted) => {
										console.log(inserted);
										db.updateOne(
											Category,
											{ categoryID: category.categoryID },
											{ runningTotal: toPush.physicalCount },
											(updated) => {
												console.log(updated);
											}
										);
									});
								}
							});
						} else {
							db.updateOne(
								Category,
								{ categoryID: category.categoryID },
								{ runningTotal: toPush.physicalCount },
								(updated) => {
									console.log(updated + "no insert");
								}
							);
						}
					});
					// change running total of the category with the manual count running total
					// record discrepancy in missing
	
					res.render("invManager_missingResult", { Missing: toPass });
				});
			});
		}
		
	},

	// owner
	getDashboard: function (req, res) {
		res.render("owner_dashboard");
	},

	getOwnerInventoryList: (req, res) => {
		db.findMany(Category, {}, {}, (categories) => {
			db.findMany(FoodGroup, {}, {}, (foodgroups) => {
				console.log(foodgroups);
				db.findMany(Unit, {}, {}, (units) => {
					let toPass = [];
					categories.forEach((category) => {
						let toPush = {
							categoryName: category.categoryName,
							foodGroupName: foodgroups[category.foodGroupID - 1].foodGroupName,
							runningTotal: category.runningTotal.toFixed(2),
							unitName: units[category.unitID - 1].unitName,
						};
						console.log(toPush);
						toPass.push(toPush);
					});
					let date = new Date(Date.now());
					let month = date.getMonth() + 1;
					let day = date.getDate();
					let year = date.getFullYear();

					let fullDate = month + "-" + day + "-" + year;
					res.render("owner_inventoryList", { details: toPass, dateToday: fullDate });
				});
			});
		});
	},

	getOwnerFiltered: async (req, res) => {
		db.findMany(Category, {}, {}, (categories) => {
			db.findMany(FoodGroup, {}, {}, (foodgroups) => {
				console.log(foodgroups);
				db.findMany(Unit, {}, {}, (units) => {
					let toPass = [];
					categories.forEach((category) => {
						let toPush = {
							categoryName: category.categoryName,
							foodGroupName: foodgroups[category.foodGroupID - 1].foodGroupName,
							runningTotal: category.runningTotal.toFixed(2),
							unitName: units[category.unitID - 1].unitName,
						};
						console.log(toPush);
						toPass.push(toPush);
					});

					if (req.body.filter == 1) {
						if (req.body.sort == 1) {
							toPass.sort((a, b) => {
								// by category ascending
								let ca = a.categoryName,
									cb = b.categoryName;

								return ca.localeCompare(cb);
							});
							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						} else if (req.body.sort == 2) {
							toPass.sort((a, b) => {
								// by category descending
								let ca = a.categoryName,
									cb = b.categoryName;

								return cb.localeCompare(ca);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						}
					} else {
						if (req.body.sort == 1) {
							toPass.sort((a, b) => {
								// by foodgroup ascending
								let ca = a.foodGroupName,
									cb = b.foodGroupName;

								return ca.localeCompare(cb);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						} else if (req.body.sort == 2) {
							toPass.sort((a, b) => {
								// by foodgroup descending
								let ca = a.foodGroupName,
									cb = b.foodGroupName;

								return cb.localeCompare(ca);
							});

							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_inventoryList", {
								details: toPass,
								dateToday: fullDate,
							});
						}
					}
				});
			});
		});
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

	getEmployeeFiltered: async (req, res) => {
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
				if (req.body.filter == 1) {
					if (req.body.sort == 1) {
						employee.sort((a, b) => {
							// by employee ascending
							let ca = a.userID,
								cb = b.userID;

							return ca.localeCompare(cb);
						});
						res.render("owner_employeeList", { employee: employee });
					} else if (req.body.sort == 2) {
						employee.sort((a, b) => {
							// by employee descending
							let ca = a.userID,
								cb = b.userID;

							return cb.localeCompare(ca);
						});
						res.render("owner_employeeList", { employee: employee });
					}
				} else if (req.body.filter == 2) {
					if (req.body.sort == 1) {
						employee.sort((a, b) => {
							// by Full Name ascending
							let ca = a.firstName + a.lastName,
								cb = b.firstName + b.lastName;

							return ca.localeCompare(cb);
						});
						res.render("owner_employeeList", { employee: employee });
					} else if (req.body.sort == 2) {
						employee.sort((a, b) => {
							// by Full Name descending
							let ca = a.firstName + a.lastName,
								cb = b.firstName + b.lastName;

							return cb.localeCompare(ca);
						});
						res.render("owner_employeeList", { employee: employee });
					}
				} else {
					if (req.body.sort == 1) {
						employee.sort((a, b) => {
							// by Position ascending
							let ca = a.position;
							cb = b.position;

							return ca.localeCompare(cb);
						});
						res.render("owner_employeeList", { employee: employee });
					} else if (req.body.sort == 2) {
						employee.sort((a, b) => {
							// by Posotion descending
							let ca = a.position;
							cb = b.position;

							return cb.localeCompare(ca);
						});
						res.render("owner_employeeList", { employee: employee });
					}
				}
			});
		});
	},

	deleteUser: async (req, res) => {
		console.log(req.params.userID);
		await db.delOne(User, { userID: req.params.userID }, (user) => {
			console.log("deleted" + user);

			res.redirect(req.get("referer"));
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

	printHello: function(req, res) {
		console.log("HELLO")
	},

	getTransactionTrail: function (req, res) {
		let date = new Date(Date.now());
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let year = date.getFullYear();

		let fullDate = month + "-" + day + "-" + year;
		res.render("owner_transTrail", { dateToday: fullDate });
	},

	getOwnerMenu: async (req, res) => {
		await db.findMany(MenuGroup, {}, {}, (menugroups) => {
			let menuIDs = [];
			menugroups.forEach((grup) => {
				menuIDs.push(grup.menuGroupID);
			});
			db.findMany(Recipe, { menuGroupID: { $in: menuIDs } }, {}, (recipes) => {
				let menugrp = [];
				menugroups.forEach((menu) => {
					let rec = [];
					recipes.forEach((recipe) => {
						if (menu.menuGroupID == recipe.menuGroupID) {
							if (recipe.enabled == true) {
								let toPush = {
									// recipe id recipe name enabled
									recipeID: recipe.recipeID,
									recipeName: recipe.recipeName,
									Status: "Enabled",
								};

								rec.push(toPush);
								console.log("pushed " + toPush.recipeID);
							} else {
								let toPush = {
									// recipe id recipe name enabled
									recipeID: recipe.recipeID,
									recipeName: recipe.recipeName,
									Status: "Disabled",
								};
								rec.push(toPush);
								console.log("pushed " + toPush.recipeID);
							}
						}
					});

					let grp = {
						MenuGroupID: menu.menuGroupID,
						MenuGroupName: menu.menuGroupName,
						Recipe: rec,
					};

					menugrp.push(grp);
				});
				let date = new Date(Date.now());
				let month = date.getMonth() + 1;
				let day = date.getDate();
				let year = date.getFullYear();
				console.log(menugrp);

				res.render("owner_menuList", {
					dateToday: month + "-" + day + "-" + year,
					menugrps: menugrp,
				});
			});
		});
	},

	toggleIngredients: async (req, res) => {
		db.findOne(Recipe, { recipeID: req.params.recipeID }, {}, (recipe) => {
			console.log(recipe);
			if (recipe.enabled == true) {
				db.updateOne(Recipe, { recipeID: recipe.recipeID }, { enabled: false }, (updated) => {
					res.redirect("/ownerMenu");
				});
			} else {
				db.updateOne(Recipe, { recipeID: recipe.recipeID }, { enabled: true }, (updated) => {
					res.redirect("/ownerMenu");
				});
			}
		});
	},

	viewIngredients: async (req, res) => {
		db.findOne(Recipe, { recipeID: req.params.recipeID }, {}, (recipe) => {
			db.findMany(IngredientList, { recipeID: req.params.recipeID }, {}, (ingredientlist) => {
				db.findMany(Category, {}, {}, (categories) => {
					db.findMany(Unit, {}, {}, (units) => {
						let ingList = [];

						ingredientlist.forEach((ing) => {
							let toPush = {
								// category amount unit
								categoryName: categories.find((categ) => categ.categoryID == ing.categoryID).categoryName,
								amount: ing.amount,
								unitName: units.find((uni) => uni.unitID == ing.unitID).unitName,
							};

							ingList.push(toPush);
						});
						console.log(ingList);
						console.log(recipe.enabled);

						if (recipe.enabled == true) {
							res.render("owner_ingredients", {
								RecipeName: recipe.recipeName,
								ingList: ingList,
								Status: "Enabled",
								recipeID: recipe.recipeID,
							});
						} else {
							res.render("owner_ingredients", {
								RecipeName: recipe.recipeName,
								ingList: ingList,
								Status: "Disabled",
								recipeID: recipe.recipeID,
							});
						}
					});
				});
			});
		});
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

				res.send(`<script>alert("Menu Group Created."); window.location.href = "/ownerMenu"; </script>`);
			} else {
				let id = 1;

				let group = {
					menuGroupID: id,
					menuGroupName: folderName,
				};

				db.insertOne(MenuGroup, group, (result) => {
					console.log(result);
				});

				res.send(`<script>alert("Menu Group Created."); window.location.href = "/ownerMenu"; </script>`);
			}
		});
	},

	//   getMenu: (req, res) => {},

	// newMenuItem: (req, res) => {},

	addMenuItem: async (req, res) => {
		console.log(req.params.menugroupID);
		await db.findOne(MenuGroup, { menuGroupID: req.params.menugroupID }, {}, (menugroup) => {
			db.findMany(Category, {}, {}, (categories) => {
				db.findMany(Unit, {}, {}, (units) => {
					toPass = [];

					categories.forEach((category) => {
						let toPush = {
							categoryID: category.categoryID,
							categoryName: category.categoryName,
							unitName: units.find((uni) => uni.unitID == category.unitID).unitName,
						};

						toPass.push(toPush);
					});
					res.render("owner_newDish", {
						menuGroupID: menugroup.menuGroupID,
						menuGroupName: menugroup.menuGroupName,
						menugroupID: req.params.menugroupID,
						Category: toPass,
					});
				});
			});
		});
	},

	submitDish: async (req, res) => {
		// dish will go to recipes
		// ingredients will go to ingredientList

		let menugroupID = req.params.menugroupID;
		let ingredients = req.body.category;
		let quantities = req.body.quantity;

		let ingredientListBody = [];

		for (let i = 0; i < ingredients.length; i++) {
			let toPush = {
				categoryID: ingredients[i],
				amount: quantities[i],
			};
			ingredientListBody.push(toPush);
		}

		await db.findMany(Recipe, {}, {}, (recipes) => {
			if (recipes.length == 0) {
				toInsert = {
					recipeID: "1",
					recipeName: req.body.itemname,
					menuGroupID: menugroupID,
					price: req.body.price,
				};
				db.insertOne(Recipe, toInsert, (inserted) => {
					db.findMany(IngredientList, {}, {}, (ingredientlists) => {
						db.findMany(Category, {}, {}, (categories) => {
							let toIngredient = [];
							let maxID = Math.max.apply(
								null,
								ingredientlists.map((li) => {
									return li.ingredientListID;
								})
							);
							let newID = 0;
							ingredientListBody.forEach((list) => {
								if (ingredientlists.length == 0) {
									let toPush = {
										ingredientListID: newID + 1,
										categoryID: list.categoryID,
										recipeID: toInsert.recipeID,
										amount: list.amount,
										unitID: categories.find((cat) => cat.categoryID == list.categoryID).unitID,
									};
									newID++;
									toIngredient.push(toPush);
								} else {
									let toPush = {
										ingredientListID: maxID + 1,
										categoryID: list.categoryID,
										recipeID: toInsert.recipeID,
										amount: list.amount,
										unitID: categories.find((cat) => cat.categoryID == list.categoryID).unitID,
									};
									maxID++;
									console.log("MAX ID " + maxID);
									toIngredient.push(toPush);
								}
							});
							console.log(toIngredient);
							db.insertMany(IngredientList, toIngredient, (inserted) => {
								res.redirect("/ownerMenu");
							});
						});
					});
				});
			} else {
				let maxID = Math.max.apply(
					null,
					recipes.map((rec) => {
						return rec.recipeID;
					})
				);
				toInsert = {
					recipeID: (maxID + 1).toString(),
					recipeName: req.body.itemname,
					menuGroupID: menugroupID,
					price: req.body.price,
				};
				db.insertOne(Recipe, toInsert, (inserted) => {
					db.findMany(IngredientList, {}, {}, (ingredientlists) => {
						db.findMany(Category, {}, {}, (categories) => {
							let toIngredient = [];
							let maxID = Math.max.apply(
								null,
								ingredientlists.map((li) => {
									return li.ingredientListID;
								})
							);
							let newID = 0;
							ingredientListBody.forEach((list) => {
								if (ingredientlists.length == 0) {
									let toPush = {
										ingredientListID: newID + 1,
										categoryID: list.categoryID,
										recipeID: toInsert.recipeID,
										amount: list.amount,
										unitID: categories.find((cat) => cat.categoryID == list.categoryID).unitID,
									};
									newID++;
									toIngredient.push(toPush);
								} else {
									let toPush = {
										ingredientListID: maxID + 1,
										categoryID: list.categoryID,
										recipeID: toInsert.recipeID,
										amount: list.amount,
										unitID: categories.find((cat) => cat.categoryID == list.categoryID).unitID,
									};
									maxID++;
									console.log("MAX ID " + maxID);
									toIngredient.push(toPush);
								}
							});
							console.log(toIngredient);
							db.insertMany(IngredientList, toIngredient, (inserted) => {
								res.redirect("/ownerMenu");
							});
						});
					});
				});
			}
		});
	},

	cancelDish: async (req, res) => {
		res.redirect("/ownerMenu");
	},

	getFoodGroup: (req, res) => {
		res.render("invManager_createFoodGroup");
	},

	getInventoryReports: async (req, res) => {
		let report = [];
		await db.findMany(Category, {}, {}, (categories) => {
			db.findMany(User, { userID: { $ne: "admin" } }, {}, (users) => {
				db.findMany(Spoilage, {}, {}, (spoilage) => {
					spoilage.forEach((spoiled) => {
						let spoiledPush = {
							caseDate: spoiled.caseDate,
							reportType: "Spoilage",
							CategoryName: categories.find((categ) => categ.categoryID == parseInt(spoiled.categoryID)).categoryName,
							amount: spoiled.amount,
							employeeName:
								users.find((user) => user.userID === spoiled.employeeNo).firstName +
								" " +
								users.find((user) => user.userID === spoiled.employeeNo).lastName,
						};

						report.push(spoiledPush);
					});
					db.findMany(Missing, {}, {}, (missing) => {
						missing.forEach((miss) => {
							let missingPush = {
								caseDate: miss.caseDate,
								reportType: "Missing",
								CategoryName: categories.find((categ) => categ.categoryID === parseInt(miss.categoryID)).categoryName,
								amount: miss.amount,
								employeeName:
									users.find((user) => user.userID == miss.employeeNo).firstName +
									" " +
									users.find((user) => user.userID == miss.employeeNo).lastName,
							};
							report.push(missingPush);
						});
						report.sort((a, b) => {
							let da = new Date(a.caseDate),
								db = new Date(b.caseDate);

							return db - da;
						});

						let date = new Date(Date.now());
						let month = date.getMonth() + 1;
						let day = date.getDate();
						let year = date.getFullYear();

						let fullDate = month + "-" + day + "-" + year;

						res.render("owner_reportsPage", {
							Report: report,
							dateToday: fullDate,
						});
					});
				});
			});
		});
	},

	getInventoryReportsFiltered: async (req, res) => {
		let report = [];
		await db.findMany(Category, {}, {}, (categories) => {
			db.findMany(User, { userID: { $ne: "admin" } }, {}, (users) => {
				db.findMany(Spoilage, {}, {}, (spoilage) => {
					spoilage.forEach((spoiled) => {
						let spoiledPush = {
							caseDate: spoiled.caseDate,
							reportType: "Spoilage",
							CategoryName: categories.find((categ) => categ.categoryID === parseInt(spoiled.categoryID)).categoryName,
							amount: spoiled.amount,
							employeeName:
								users.find((user) => user.userID === spoiled.employeeNo).firstName +
								" " +
								users.find((user) => user.userID === spoiled.employeeNo).lastName,
						};

						report.push(spoiledPush);
					});
					db.findMany(Missing, {}, {}, (missing) => {
						missing.forEach((miss) => {
							let missingPush = {
								caseDate: miss.caseDate,
								reportType: "Missing",
								CategoryName: categories.find((categ) => categ.categoryID === parseInt(miss.categoryID)).categoryName,
								amount: miss.amount,
								employeeName:
									users.find((user) => user.userID === miss.employeeNo).firstName +
									" " +
									users.find((user) => user.userID === miss.employeeNo).lastName,
							};
							report.push(missingPush);
						});

						if (req.body.filter == 1) {
							if(req.body.type == 1){
								if (req.body.sort == 1) {
		
									report.sort((a, b) => {
										let da = new Date(a.caseDate),
											db = new Date(b.caseDate);
										// Date Ascending
										return da - db;
									});
									let date = new Date(Date.now());
									let month = date.getMonth() + 1;
									let day = date.getDate();
									let year = date.getFullYear();

									let fullDate = month + "-" + day + "-" + year;

									res.render("owner_reportsPage", {
										Report: report,
										dateToday: fullDate,
									});
								} else if (req.body.sort == 2) {
								report.sort((a, b) => {
									let da = new Date(a.caseDate),
										db = new Date(b.caseDate);
									// Date Descending
									return db - da;
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("owner_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							}
						} else if (req.body.type == 2){
							if (req.body.sort == 1) {
		
								report.sort((a, b) => {
									let da = new Date(a.caseDate),
										db = new Date(b.caseDate),
										ta = a.reportType,
										tb = b.reportType;
										

									// Date Ascending
									return da - db && ta.localeCompare(tb);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("owner_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							} else if (req.body.sort == 2) {
							report.sort((a, b) => {
								let da = new Date(a.caseDate),
									db = new Date(b.caseDate),
									ta = a.reportType,
									tb = b.reportType;
								// Date Descending
								return db - da && tb.localeCompare(ta);
							});
							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_reportsPage", {
								Report: report,
								dateToday: fullDate,
							});
						}

						}else if (req.body.type == 3){
							if (req.body.sort == 1) {
		
								report.sort((a, b) => {
									let da = new Date(a.caseDate),
										db = new Date(b.caseDate),
										ta = a.reportType,
										tb = b.reportType;
									// Date Ascending
									return da - db && tb.localeCompare(ta);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("owner_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							} else if (req.body.sort == 2) {
							report.sort((a, b) => {
								let da = new Date(a.caseDate),
									db = new Date(b.caseDate),
									ta = a.reportType,
									tb = b.reportType;
								// Date Descending
								return db - da && ta.localeCompare(tb);
							});
							let date = new Date(Date.now());
							let month = date.getMonth() + 1;
							let day = date.getDate();
							let year = date.getFullYear();

							let fullDate = month + "-" + day + "-" + year;

							res.render("owner_reportsPage", {
								Report: report,
								dateToday: fullDate,
							});
						}

						}

						} else {
							if(req.body.type == 1){
							if (req.body.sort == 1) {
								report.sort((a, b) => {
									let ra = a.employeeName,
										rb = b.employeeName;
							
									//employee name ascending
									return ra.localeCompare(rb);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("owner_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							} else if (req.body.sort == 2) {
								report.sort((a, b) => {
									let ra = a.employeeName,
										rb = b.employeeName;
										
									//employee name descending
									return rb.localeCompare(ra);
								});
								let date = new Date(Date.now());
								let month = date.getMonth() + 1;
								let day = date.getDate();
								let year = date.getFullYear();

								let fullDate = month + "-" + day + "-" + year;

								res.render("owner_reportsPage", {
									Report: report,
									dateToday: fullDate,
								});
							}
							} else if (req.body.type == 2){
									if (req.body.sort == 1) {
										report.sort((a, b) => {
											let ra = a.employeeName + a.reportType,
												rb = b.employeeName + b.reportType;
											//employee name ascending
											return ra.localeCompare(rb);
										});
										let date = new Date(Date.now());
										let month = date.getMonth() + 1;
										let day = date.getDate();
										let year = date.getFullYear();
		
										let fullDate = month + "-" + day + "-" + year;
		
										res.render("owner_reportsPage", {
											Report: report,
											dateToday: fullDate,
										});
									} else if (req.body.sort == 2) {
										report.sort((a, b) => {
											let ra = a.employeeName,
												rb = b.employeeName,
												ta = a.reportType,
												tb = b.reportType;
											//employee name descending
											return rb.localeCompare(ra) && tb.localeCompare(ta);
										});
										let date = new Date(Date.now());
										let month = date.getMonth() + 1;
										let day = date.getDate();
										let year = date.getFullYear();
		
										let fullDate = month + "-" + day + "-" + year;
		
										res.render("owner_reportsPage", {
											Report: report,
											dateToday: fullDate,
										});
									}
									
							} else if(req.body.type == 3){
									if (req.body.sort == 1) {
										report.sort((a, b) => {
											let ra = a.employeeName,
												rb = b.employeeName,
												ta = a.reportType,
												tb = b.reportType;
											//employee name ascending
											return ra.localeCompare(rb) && tb.localeCompare(ta);
										});
										let date = new Date(Date.now());
										let month = date.getMonth() + 1;
										let day = date.getDate();
										let year = date.getFullYear();
		
										let fullDate = month + "-" + day + "-" + year;
		
										res.render("owner_reportsPage", {
											Report: report,
											dateToday: fullDate,
										});
									} else if (req.body.sort == 2) {
										report.sort((a, b) => {
											let ra = a.employeeName,
												rb = b.employeeName,
												ta = a.reportType,
												tb = b.reportType;
											//employee name descending
											return rb.localeCompare(ra) && ta.localeCompare(tb);
										});
										let date = new Date(Date.now());
										let month = date.getMonth() + 1;
										let day = date.getDate();
										let year = date.getFullYear();
		
										let fullDate = month + "-" + day + "-" + year;
		
										res.render("owner_reportsPage", {
											Report: report,
											dateToday: fullDate,
										});
									}
									
							}
						}
					});
				});
			});
		});
	},

	addIngredient: async (req, res) => {
		await db.findOne(MenuGroup, { menuGroupID: req.params.menugroupID }, {}, (menugroup) => {
			db.findOne(Recipe, { recipeID: req.params.recipeID }, {}, (recipe) => {
				db.findMany(Category, {}, {}, (categories) => {
					db.findMany(Unit, {}, {}, (units) => {
						let toPass = [];

						categories.forEach((category) => {
							let toPush = {
								categoryID: category.categoryID,
								categoryName: category.categoryName,
								unitName: units.find((unit) => unit.unitID == category.unitID).unitName,
							};

							toPass.push(toPush);
						});

						res.render("owner_addIngredient", {
							recipe: recipe,
							menugroup: menugroup,
							Category: toPass,
						});
					});
				});
			});
		});
	},

	testing: async (req, res) => {
		console.log(req.body.categoryname);
		console.log(req.body.myname);
		res.redirect("/testing");
	},

	getTesting: (req, res) => {
		res.render("testingPage");
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

//testing for viewDish
// viewDish: (req, res) => {
//   res.render("owner_viewDish");
// },

module.exports = controller;
