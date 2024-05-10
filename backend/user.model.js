const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  twitterProvider: {
    type: {
      id: String,
      token: String,
    },
  },
});

UserSchema.statics.upsertTwitterUser = async function (
  token,
  tokenSecret,
  profile,
  cb
) {
  var that = this;
  const user = await this.findOne({
    'twitterProvider.id': profile.id,
  });

  if (!user) {
    try {
      const newUser = await this.create({
        email: profile.emails[0].value,
        twitterProvider: {
          id: profile.id,
          token: token,
          tokenSecret: tokenSecret,
        },
      });
      return cb(null, newUser);
    } catch (err) {
      return cb(err);
    }
  } else {
    return cb(null, user);
  }
  // return this.findOne(
  //   {
  //     'twitterProvider.id': profile.id,
  //   },
  //   async function (err, user) {
  //     // no user was found, lets create a new one
  //     if (!user) {
  //       var newUser = new that({
  //         email: profile.emails[0].value,
  //         twitterProvider: {
  //           id: profile.id,
  //           token: token,
  //           tokenSecret: tokenSecret,
  //         },
  //       });
  //       try {
  //         const newUs = await newUser.save();
  //         return cb(error, newUs);
  //       } catch (error) {
  //         return cb(error, false);
  //       }
  //       // newUser.save(function (error, savedUser) {
  //       //   if (error) {
  //       //     console.log(error);
  //       //   }
  //       //   return cb(error, savedUser);
  //       // });
  //     } else {
  //       return cb(err, user);
  //     }
  //   }
  // );
};

const UserModel = model('User', UserSchema);

module.exports = UserModel;
