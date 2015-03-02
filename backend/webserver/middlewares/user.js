'use strict';

var conference = require('../../core/conference');
var uuid = require('node-uuid');

/**
 * @param {request} req
 * @param {response} res
 * @param {function} next
 * @return {*}
 */
module.exports.load = function(req, res, next) {

  if (req.user) {
    return next();
  }

  req.user = {
    objectType: 'hublin:anonymous',
    id: uuid.v4(),
    displayName: req.query.displayName || 'anonymous',
    connection: {
      ipAdress: '',
      userAgent: req.headers['user-agent']
    }
  };

  return next();
};

/**
 * Load user data from cookie information
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @return {*}
 */
module.exports.loadFromCookie = function(req, res, next) {
  if (!req.conference) {
    return next();
  }

  var userIds = req.cookies['hublin.userIds'];
  var members = req.conference.members.filter(function(member) {
    if (userIds.indexOf(member._id) > -1) {
      return member;
    }
  });

  if (members && members.length > 0) {
    req.user = members[0];
  }

  return next();
};

/**
 * Set the request user as cookie
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @return {*}
 */
module.exports.setUserCookie = function(req, res, next) {

  if (req.user) {
    res.cookie('user', JSON.stringify(req.user));
  }

  return next();
};

/**
 * Set the request user from its token
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @return {*}
 */
module.exports.loadFromToken = function(req, res, next) {
  if (!req.query.token) {
    return next();
  }

  conference.getMemberFromToken(req.query.token, function(err, member) {
    if (err) {
      return res.send(500);
    }

    if (!member) {
      return res.send(404);
    }

    req.user = member;
    return next();
  });
};

