
// Load Express

import express from 'express';
import session from 'express-session'
import redis from 'redis';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import { userController } from './controllers/user-controller';
const app = express();

// Session cookies and CSRF tokens require cookie parser

app.use(cookieParser());

// Turn on parsing of incoming JSON

app.use(express.json());

// Enable CORS

import cors from 'cors';
app.use(cors());

// Enable CSRF tokens using the double submit cookie pattern for CSRF protection

import csurf from 'csurf';
const csrfFilter = csurf({ cookie: { sameSite: true } });
app.use(csrfFilter);
app.all("*", (req, res, next) => {
  const csrfReq = req as { csrfToken?(): string };
  const token = csrfReq.csrfToken();
  res.cookie("XSRF-TOKEN", token, { sameSite: true });
  return next();
});
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  console.log('CSRF error accessing', req.url);
  res.status(403);
  res.send('Error: invalid CSRF token');
});

// Load Express session configuration

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({ host: 'localhost' });
const sessionConfig = session({
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

const config = {
  dbUrl: 'mongodb://localhost/quoteboard-development',
  listenPort: 3333
};
import mongoose from 'mongoose';
console.log('Attempting to connect to MongoDB right now!');
mongoose.connect(config.dbUrl, { })
  .then(() => {
    console.log('Mongo connection successful.');
    // mongoose.set('useCreateIndex', true);
  })
  .catch((err) => {
    console.log('Mongo connection failed. Reason:');
    console.log(err);
  });

// Load user controller

app.use(userController);

// Set up GET /api/version route

app.route('/api/version').get(version);

function version(req: any, res: any) {
  res.send({ version: '0.1' });
}

// Log invalid incoming URLs

app.use((req: any, res, next) => {
  if (!req.route) {
    console.log('Invalid request for URL ' + req.url);
  }
  next();
});

// Start server

console.log('Listening on port ' + config.listenPort);
app.listen(config.listenPort);
