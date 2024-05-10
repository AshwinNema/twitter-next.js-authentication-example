const TwitterTokenStrategy = require('passport-twitter-token');
const User = require('./user.model');

module.exports = new TwitterTokenStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    includeEmail: true,
  },
  function (token, tokenSecret, profile, done) {
    User.upsertTwitterUser(
      token,
      tokenSecret,
      profile,
      function (err, user) {
        return done(err, user);
      }
    );
  }
)