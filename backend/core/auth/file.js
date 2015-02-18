'use strict';

//
// File-based user database.
// The user file is located under the config directory and ysers are serialized as JSON array.
//

var bcrypt = require('bcrypt-nodejs');
var extend = require('extend');

/**
 * Crypt a password
 *
 * @param {String} password
 * @param {function} callback
 */
function crypt(password, callback) {
  var SALT_FACTOR = 5;
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) {
      return callback(err);
    }
    bcrypt.hash(password, salt, null, function(err, hash) {
      if (err) {
        return callback(err);
      } else {
        return callback(err, hash);
      }
    });
  });
}
/**
 * @type {crypt}
 */
module.exports.crypt = crypt;

/**
 * Compare passwords
 *
 * @param {String} a
 * @param {String} b
 * @param {Function} cb
 */
function comparePassword(a, b, cb) {
  bcrypt.compare(a, b, function(err, isMatch) {
    if (err) {
      return cb(err);
    } else {
      cb(null, isMatch);
    }
  });
}
/**
 * @type {comparePassword}
 */
module.exports.comparePassword = comparePassword;

var users;
try {
  users = require('../../../config/users.json').users;
} catch (err) {
  users = [];
}

function isEmailInProfile(email, profile) {
  if (!profile.emails || !profile.emails.forEach) {
    return false;
  }

  var filteredEmails = profile.emails.filter(
    function(profileEmail) {
      return profileEmail.value === email;
    }
  );
  return (filteredEmails.length > 0);
}

function getProfileFromUser(user) {
  var profile = {provider: 'file'};
  extend(true, profile, user);
  delete profile.password;
  return profile;
}

/**
 * Authenticate a user from its username and password
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} done
 * @return {*}
 */
function auth(username, password, done) {
  var user;
  for (var i = 0, len = users.length; i < len; i++) {
    var u = users[i];
    if (isEmailInProfile(username, u)) {
      user = u;
      break;
    }
  }

  if (!user) {
    return done(null, false, { message: 'user not found'});
  }

  comparePassword(password, user.password, function(err, isMatch) {
    if (isMatch) {
      return done(null, getProfileFromUser(user));
    }
    return done(null, false, { message: 'invalid password for user ' + username});
  });
}
/**
 * @type {auth}
 */
module.exports.auth = auth;
