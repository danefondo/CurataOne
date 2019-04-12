const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    console.log("First login check.")
    let query = {username:username};

    console.log("2nd login check.")
    User.findOne(query, function(err, user){
      console.log(`Login error: ${err}`)
      if(err) throw err;
      if(!user){
        console.log("no user")
        return done(null, false, {message: 'No user found'});
      }
      console.log("3rd login check.")
      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        console.log("4th login check.")
        if(err) throw err;
        if(isMatch){
          console.log("5th login check.")
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password'});
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
    console.log("Done serializing " + user.id)
  });

  passport.deserializeUser(function(id, done) {
    console.log("Deserializing")

    User.findById(id, function(err, user) {
      console.log("Found serialized user")
      done(err, user);
    });
  });
}