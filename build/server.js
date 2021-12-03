"use strict";
// Load Express
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var redis_1 = __importDefault(require("redis"));
var connect_redis_1 = __importDefault(require("connect-redis"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var user_controller_1 = require("./controllers/user-controller");
var app = (0, express_1.default)();
// Session cookies and CSRF tokens require cookie parser
app.use((0, cookie_parser_1.default)());
// Turn on parsing of incoming JSON
app.use(express_1.default.json());
// Enable CORS
var cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
// Enable CSRF tokens using the double submit cookie pattern for CSRF protection
var csurf_1 = __importDefault(require("csurf"));
var csrfFilter = (0, csurf_1.default)({ cookie: { sameSite: true } });
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
// Load Express session configuration
var RedisStore = (0, connect_redis_1.default)(express_session_1.default);
var redisClient = redis_1.default.createClient({ host: 'localhost' });
var sessionConfig = (0, express_session_1.default)({
    store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redisClient
    }),
    cookie: { secure: false, sameSite: true },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
});
app.use(sessionConfig);
// Connect to Mongo
var config = {
    dbUrl: 'mongodb://localhost/quoteboard-development',
    listenPort: 3333
};
var mongoose_1 = __importDefault(require("mongoose"));
console.log('Attempting to connect to MongoDB right now!');
mongoose_1.default.connect(config.dbUrl, {})
    .then(function () {
    console.log('Mongo connection successful.');
    // mongoose.set('useCreateIndex', true);
})
    .catch(function (err) {
    console.log('Mongo connection failed. Reason:');
    console.log(err);
});
// Load user controller
app.use(user_controller_1.userController);
// Set up GET /api/version route
app.route('/api/version').get(version);
function version(req, res) {
    res.send({ version: '0.1' });
}
// Log invalid incoming URLs
app.use(function (req, res, next) {
    if (!req.route) {
        console.log('Invalid request for URL ' + req.url);
    }
    next();
});
// Start server
console.log('Listening on port ' + config.listenPort);
app.listen(config.listenPort);
//# sourceMappingURL=server.js.map