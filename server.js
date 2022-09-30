const express = require('express');
const {limiterPublic, limiterPrivate} = require('./src/rateLimiterGroups.js');

require('dotenv').config();
const PORT = process.env.PORT || 7777;

const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

app.get(
    '/',
    (req, res, next) => limiterPublic(req, res, next, 1),
    (req, res) => {
      res.status(200).send('Welcome to the public page');
    },
);

app.get(
    '/2',
    (req, res, next) => limiterPublic(req, res, next, 2),
    (req, res) => {
      res.status(200).send('Welcome to the public page 2');
    },
);
app.get(
    '/3',
    (req, res, next) => limiterPublic(req, res, next, 3),
    (req, res) => {
      res.status(200).send('Welcome to the public page 3');
    },
);
app.get(
    '/4',
    (req, res, next) => limiterPublic(req, res, next, 4),
    (req, res) => {
      res.status(200).send('Welcome to the public page 4');
    },
);
app.get(
    '/5',
    (req, res, next) => limiterPublic(req, res, next, 5),
    (req, res) => {
      res.status(200).send('Welcome to the public page 5');
    },
);

app.get(
    '/private',
    auth,
    (req, res, next) => limiterPrivate(req, res, next, 1),
    (req, res) => {
      res.status(200).send('Welcome to the private page');
    },
);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = app;
