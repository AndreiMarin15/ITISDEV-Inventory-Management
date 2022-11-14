const mongoose = require("mongoose");

const url = ""; // insert connection string to database

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};
// everything will only be used sa ___Controller.js these will be the replacement of usual functions because marami tayo controllers and marami rin models
const db = {
    connect: () => {
        mongoose.connect(url, options, (err) => {
            if (err) throw err;
            console.log("Connected to: " + url);
        });
    },

    findOne: (model, query, projection, cb) => {
        model.findOne(query, projection, (err, res) => {
            if (err) return cb(false);
            return cb(res);
        });
    },

    findMany: (model, query, projection, cb) => {
        model.find(query, projection, (err, res) => {
            if (err) return cb(false);
            return cb(res);
        });
    },

    insertOne: (model, docu, cb) => {
        model.create(docu, (err, res) => {
            if (err) return cb(false);
            console.log("Added: " + res);
            return cb(true);
        });
    },

    insertMany: (model, docs, cb) => {
        model.insertMany(docs, (err, res) => {
            if (err) return cb(false);
            console.log("Added: " + res);
            return cb(true);
        });
    },

    updateOne: (model, filter, update, cb) => {
        model.updateOne(filter, update, (err, res) => {
            if (err) return cb(false);
            console.log("Updated: " + res.nModified);
            return cb(true);
        });
    },

    updateMany: (model, filter, update, cb) => {
        model.updateMany(filter, update, (err, res) => {
            if (err) return cb(false);
            console.log("Updated: " + res.nModified);
            return cb(true);
        });
    },

    delOne: (model, conditions, cb) => {
        model.deleteOne(conditions, (err, res) => {
            if (err) return cb(false);
            console.log("Deleted: " + res.deletedCount);
            return cb(true);
        });
    },

    delMany: (model, conditions, cb) => {
        model.deleteMany(conditions, (err, res) => {
            if (err) return cb(false);
            console.log("Deleted: " + res.deletedCount);
            return cb(true);
        });
    },
};

module.exports = db;
