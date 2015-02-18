'use strict';

var conf = require('../../core')['esn-config']('session');

// 30*24*60*60*1000 = 30 days
var maxAge = 2592000000;

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports.set = function(req, res, next) {
  if (req.body.rememberme) {
    conf.get(function(err, data) {
      if (err) {
        req.session.cookie.maxAge = maxAge;
      } else if (!data || !data.remember) {
        req.session.cookie.maxAge = maxAge;
      } else {
        req.session.cookie.maxAge = data.remember;
      }
      next();
    });
  } else {
    req.session.cookie.expires = false;
    next();
  }
};
