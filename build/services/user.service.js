"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.userService = void 0;
var passport_1 = __importDefault(require("passport"));
var passportLocal = __importStar(require("passport-local"));
var LocalStrategy = passportLocal.Strategy;
var argon2 = __importStar(require("argon2"));
var user_1 = require("../models/user");
passport_1.default.use(new LocalStrategy({ usernameField: 'email' }, function (username, password, done) {
    return user_1.User.findOne({ email: username }, function (error, user) {
        if (error) {
            return done(error);
        }
        if (!user) {
            return done(null, false, {
                message: 'Invalid email or password'
            });
        }
        if (user) {
            return validateUserPassword(user.passwordHash, password)
                .then(function (validated) {
                if (validated) {
                    return done(user);
                }
                else {
                    return done(null, false, {
                        message: 'Invalid email or password'
                    });
                }
            })
                .catch(function (verror) {
                console.log('Error in password validation:');
                console.log(verror);
                return done(verror);
            });
        }
    });
}));
function validateUserPassword(hash, password) {
    return argon2.verify(hash, password)
        .then(function (verified) {
        return verified;
    })
        .catch(function (error) {
        console.log('Error in hash validation:', error);
        return error;
    });
}
var userService = {
    GetUsers: function () {
        return new Promise(function (resolve, reject) {
            user_1.User.find()
                .then(function (users) {
                resolve(users);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    },
    RegisterUser: function (user) {
        return registerUser(user)
            .then(function (result) {
            return result;
        })
            .catch(function (error) {
            console.log('Error in userService');
            console.log(error);
            return error;
        });
    },
    UpdateUser: function (user, updates) {
        var updatesAllowed = {};
        if (updates.id)
            updatesAllowed['id'] = updates.id;
        if (updates.name)
            updatesAllowed['name'] = updates.name;
        return new Promise(function (resolve, reject) {
            user.updateOne(updatesAllowed, function (err, result) {
                if (err) {
                    console.log('Update failed: ' + err);
                    reject();
                }
                else {
                    console.log('Update success:');
                    console.log(result);
                    resolve();
                }
            });
        });
    },
    GetUser: function (email) {
        return getUser(email)
            .then(function (result) {
            return result;
        })
            .catch(function (error) {
            console.log('Error getting user');
            console.log(error);
            return error;
        });
    },
};
exports.userService = userService;
;
function registerUser(userObject) {
    return new Promise(function (resolve, reject) {
        var user = new user_1.User();
        user.email = userObject.email;
        user.name = userObject.name;
        argon2.hash(userObject.password, { type: argon2.argon2id }).then(function (hash) {
            user.passwordHash = hash;
            user.save(function (error) {
                if (error) {
                    console.log('Error saving user');
                    console.log(error);
                    reject(error);
                }
                resolve({ emailAddress: user.email });
            });
        }).catch(function (error) {
            console.log('Error hashing user password');
            console.log(error);
            reject(error);
        });
    });
}
function loginUser(req, res) {
    return new Promise(function (resolve, reject) {
        passport_1.default.authenticate('local', function (user, error, info) {
            if (error) {
                console.log('Error authenticating user:');
                console.log(error);
                reject(error);
            }
            if (info) {
                console.log('Info from authenticate user:');
                console.log(info);
                reject(info);
            }
            if (user) {
                resolve({ user: user });
            }
        })(req, res);
    });
}
exports.loginUser = loginUser;
function getUser(email) {
    return user_1.User.findOne({ email: email })
        .then(function (user) {
        if (!user) {
            return ({ message: 'Error getting user' });
        }
        else {
            return user;
        }
    });
}
//# sourceMappingURL=user.service.js.map