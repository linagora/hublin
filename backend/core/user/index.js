'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var q = require('q');

/**
 * @param {hash} user
 * @return {*}
 */
function save(user) {
  var defer = q.defer();

  if (!user) {
    defer.reject(new Error('user can not be null'));
  }

  new User(user).save(defer.makeNodeResolver());
  return defer.promise;
}

/**
 * @type {{save: save}}
 */
module.exports = {
  save: save
};
