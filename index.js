const dotenv = require("dotenv");
const express = require("express");
const hbs = require("hbs");
const bodyparser = require("body-parser");
const routes = require("./routes/routes");
const cors = require("cors");

const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

const db = require("./models/db.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.set("view engine", "hbs");

const store = new MongoDBSession({
    uri: "mongodb+srv://itisdev:00000000@inventory-management.ngqejrn.mongodb.net/",
    collection: "Sessions",
});

app.use(
    session({
        secret: "database",
        resave: false,
        saveUninitialized: false,
        store: store,
        expires: new Date(Date.now() + 864000000),
    })
);
hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("ifIn", function (elem, list, options) {
    if (list.indexOf(elem) > -1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

dotenv.config();
port = process.env.PORT;
hostname = process.env.HOSTNAME;

app.use(express.static(`public`));
app.use(routes);

db.connect();

app.listen(port, hostname, function () {
    console.log(`Server is running at:`);
    console.log(`http://` + hostname + `:` + port);
});
