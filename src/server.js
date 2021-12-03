"use strict";
// Load Express
exports.__esModule = true;
var express_1 = require("express");
var app = (0, express_1["default"])();
// Turn on parsing of incoming JSON
var bodyParser = require("body-parser");
app.use(bodyParser.json());
// Enable CORS
var cors_1 = require("cors");
app.use((0, cors_1["default"])());
// Enable CSRF tokens using the double submit cookie pattern for CSRF protection
var csurf_1 = require("csurf");
var csrfFilter = (0, csurf_1["default"])({ cookie: { sameSite: true } });
app.use(csrfFilter);
app.all("*", function (req, res, next) {
    var csrfReq = req;
    var token = csrfReq.csrfToken();
    res.cookie("XSRF-TOKEN", token, { sameSite: true });
    return next();
});
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN')
        return next(err);
    console.log('CSRF error accessing', req.url);
    res.status(403);
    res.send('Error: invalid CSRF token');
});
// Connect to Mongo
var config = {
    dbUrl: 'mongodb://localhost/quoteboard-development',
    listenPort: 3333
};
var mongoose_1 = require("mongoose");
console.log('Attempting to connect to MongoDB...');
mongoose_1["default"].connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function () {
    console.log('Mongo connection successful.');
    mongoose_1["default"].set('useCreateIndex', true);
})["catch"](function (err) {
    console.log('Mongo connection failed. Reason:');
    console.log(err);
});
