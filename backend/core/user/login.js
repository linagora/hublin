'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var config = require('../esn-config')('login');
var pubsub = require('../pubsub').local;
var defaultLoginFailure = 5;

/**
 *
 * @param {string} email
 * @param {function} callback
 */
module.exports.success = function(email, callback) {
  User.loadFromEmail(email, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(new Error('No such user ' + email));
    }
    pubsub.topic('login:success').publish(user);
    user.loginSuccess(callback);
  });
};

/**
 *
 * @param {string} email
 * @param {function} callback
 */
module.exports.failure = function(email, callback) {
  User.loadFromEmail(email, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(new Error('No such user ' + email));
    }
    pubsub.topic('login:failure').publish(user);
    user.loginFailure(callback);
  });
};

/**
 *
 * @param {string} email
 * @param {function} callback
 */
module.exports.canLogin = function(email, callback) {
  var size = defaultLoginFailure;
  config.get(function(err, data) {
    if (data && data.failure && data.failure.size) {
      size = data.failure.size;
    }

    User.loadFromEmail(email, function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(new Error('No such user ' + email));
      }
      if (user.login.failures && user.login.failures.length >= size) {
        return callback(null, false);
      }
      return callback(err, true);
    });
  });
};

