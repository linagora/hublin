'use strict';

var async = require('async');
var mongoose = require('mongoose');

/**
 * Deploy users
 * @param {function} callback
 */
module.exports = function(callback) {
  console.log('[INFO] Deploying users');
  var users = require('./users.json').users;

  require('../../../backend/core/db/mongo/models/user');
  var User = mongoose.model('User');
  async.map(users, function(user, callback) {
      console.log('USER');
      console.log(user);
      new User(user).save(function(err, saved) {
        if (err) {
          return callback(err);
        }
        console.log('[INFO] user successfully deployed', saved);
        return callback(null, saved);
      });
    },
    function(err, results) {
      callback(err, results);
    }
  );
};
