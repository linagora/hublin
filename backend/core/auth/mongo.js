'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');

/**
 * Authenticate a user from one of its email and password
 *
 * @param {String} email
 * @param {String} password
 * @param {Function} done
 */
function auth(email, password, done) {
  User.loadFromEmail(email, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Email ' + email + ' not found'});
    }
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}
/**
 * @type {auth}
 */
module.exports.auth = auth;
