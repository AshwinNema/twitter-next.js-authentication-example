const express = require('express');
const app = express();
const cors = require('cors');

const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');
const addOAuthInterceptor = require('axios-oauth-1.0a').default;

const options = {
  algorithm: 'HMAC-SHA1',
  key: process.env.TWITTER_CONSUMER_KEY,
  secret: process.env.TWITTER_CONSUMER_SECRET,
};

addOAuthInterceptor(axios, options);

const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportStrategy = require('./passport');
passport.use('twitter-token', passportStrategy);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var createToken = function (auth) {
  return jwt.sign(
    {
      id: auth.id,
    },
    'my-secret',
    {
      expiresIn: 60 * 120,
    }
  );
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};
app.post('/auth/twitter/request_token', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.twitter.com/oauth/request_token',
      {
        oauth_callback: 'http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback',
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      }
    );

    const parsedData = parseResponse(response.data);

    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post(
  '/auth/twitter',
  async (req, _, next) => {
    const response = await axios.post(
      `https://api.twitter.com/oauth/access_token?oauth_token=${req.query.oauth_token}&oauth_verifier=${req.query.oauth_verifier}`
    );
    const parsedData = parseResponse(response.data);

    req.body['oauth_token'] = parsedData.oauth_token;
    req.body['oauth_token_secret'] = parsedData.oauth_token_secret;
    req.body['user_id'] = parsedData.user_id;

    next();
  },
  passport.authenticate('twitter-token', { session: false }),
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('User Not Authenticated');
    }

    req.auth = {
      id: req.user.id,
    };

    next();
  },
  function (req, res, next) {
    req.token = createToken(req.auth);
    return next();
  },
  generateToken,
  sendToken
);

function parseResponse(body) {
  const keyValuePairs = body.split('&');
  const parsedData = {};
  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    parsedData[key] = decodeURIComponent(value);
  });
  return parsedData;
}

mongoose
  .connect(process.env['MONGO_DB_URL'])
  .then(() => {
    app.listen(4000, () => {
      console.log('Server is running');
    });
  })
  .catch((err) => {
    console.log(err);
  });
