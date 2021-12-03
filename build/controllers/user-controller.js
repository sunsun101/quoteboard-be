"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
var express_1 = __importDefault(require("express"));
var user_service_1 = require("../services/user.service");
var userController = (0, express_1.default)();
exports.userController = userController;
// Check double-submit cookies
userController.use(function (req, res, next) {
    try {
        // userService.VerifyXSRFToken(req, res);
    }
    catch (e) {
    }
    next();
});
// Routes
userController.route('/api/register').post(registerRoute);
userController.route('/api/login').post(loginRoute);
function checkIfAuthenticated(req, res, next) {
    if (req.user) {
        req.user
            .then(function (user) {
            delete req.user;
            req.user = user;
            return next();
        })
            .catch(function (err) {
            console.log('Invalid authentication: ' + err.message);
            res.status(401).send({ message: 'User login required.' });
        });
    }
    else {
        console.log('Unauthenticated request.');
        res.status(401).send({ message: 'User login required.' });
    }
}
// Middleware to authorize request after authentication
function checkIfPermitted(req, res, next) {
    var userRequested = req.params.userId;
    var userAuthenticated = req.user.id;
    if (userRequested === userAuthenticated || req.user.isAdmin) {
        return next();
    }
    console.log('Unauthorized request by user ' + req.user.id);
    res.status(401).send({ message: 'Unauthorized request.' });
}
// Middleware to authorize admin requests after authentication
function checkIfAdmin(req, res, next) {
    var userAuthenticated = req.user.id;
    if (req.user.isAdmin) {
        return next();
    }
    console.log('Unauthorized request by user ' + req.user.id);
    res.status(401).send({ message: 'Unauthorized request.' });
}
// Route to register a user
function registerRoute(req, res) {
    if (req && req.body && req.body.email) {
        console.log('Request to register ' + encodeURIComponent(req.body.email));
        user_service_1.userService.RegisterUser(req.body)
            .then(function (result) {
            if (result) {
                var message = 'Registration successful.';
                res.send({ message: message });
            }
            else if (result && result.errmsg && result.errmsg.match('duplicate key')) {
                console.log("duplicate key");
                res.status(409).send({ message: 'Email is already taken.' });
            }
            else {
                console.log('Unexpected registration result:');
                console.log(result);
                res.sendStatus(500);
            }
        })
            .catch(function (error) {
            console.log('Caught registration error:');
            console.log(error);
            res.sendStatus(500);
        });
    }
    else {
        console.log('Invalid request: ' + encodeURIComponent(req.body.toString()));
        res.sendStatus(400);
    }
}
// Route to login a user
function loginRoute(req, res) {
    if (req && req.body && req.body.email) {
        console.log('Request to authenticate ' + encodeURIComponent(req.body.email));
        (0, user_service_1.loginUser)(req, res)
            .then(function (result) {
            if (result && result.user && result.user.email) {
                console.log('Successful login for user', result.user.email);
                var message = 'Login successful.';
                res.send({
                    message: message,
                    isAdmin: result.user.isAdmin,
                    name: result.user.name,
                    email: result.user.email
                });
            }
            else {
                console.log('Unexpected login result:');
                console.log(result);
                res.sendStatus(500);
            }
        })
            .catch(function (error) {
            console.log('Authentication failed:');
            console.log(error);
            res.sendStatus(401);
        });
    }
    else {
        console.log('Invalid request: ' + encodeURIComponent(req.body.toString()));
        res.sendStatus(400);
    }
}
// Route to logout a user
userController.route('/logout').post(userLogout);
function userLogout(req, res) {
    if (req.session.username) {
        req.session.username = null;
        res.sendStatus(200);
    }
    else {
        res.sendStatus(400);
    }
}
//# sourceMappingURL=user-controller.js.map