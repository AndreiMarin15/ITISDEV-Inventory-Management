const db = require("../models/db");
const User = require("../models/User");

const controller = {
    getIndex: (req, res) => {
        res.render("login");
    },

    login: (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let fName = "Andrei";
        let lName = "Marin";
        let type = 1;

        const newUser = new User({
            userID: username,
            firstName: fName,
            lastName: lName,
            password: password,
            userType: type,
        });

        db.insertOne(User, newUser, (result) => {
            res.json(result);
        });

        res.redirect("/");
    },
};

module.exports = controller;
