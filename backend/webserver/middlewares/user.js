'use strict';

var conference = require('../../core/conference');
var uuid = require('node-uuid');

/**
 *
 * @param {Dependencies} dependencies
 * @return {{load: load, loadFromCookie: loadFromCookie, setUserCookie: setUserCookie, loadFromToken: loadFromToken}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger');

  /**
   * @param {request} req
   * @param {response} res
   * @param {function} next
   * @return {*}
   */
  function load(req, res, next) {

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
  }

  /**
   * Load user data from cookie information
   *
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @return {*}
   */
  function loadFromCookie(req, res, next) {
    if (!req.conference) {
      return next();
    }

    var userIds = req.cookies['hublin.userIds'] || [];
    var members = req.conference.members.filter(function(member) {
      if (userIds.indexOf(member._id) > -1) {
        return member;
      }
    });

    if (members && members.length > 0) {
      req.user = members[0];
    }

    return next();
  }

  /**
   * Set the request user as cookie
   *
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @return {*}
   */
  function setUserCookie(req, res, next) {

    if (req.user) {
      res.cookie('user', JSON.stringify(req.user));
    }

    return next();
  }

  /**
   * Set the request user from its token
   *
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @return {*}
   */
  function loadFromToken(req, res, next) {
    if (!req.query.token) {
      return next();
    }

    conference.getMemberFromToken(req.query.token, function(err, member) {
      if (err) {
        logger.error('Can not get member from token %e', err);
        return res.send(500);
      }

      if (!member) {
        return res.send(404);
      }

      req.user = member;
      return next();
    });
  }

  return {
    load: load,
    loadFromCookie: loadFromCookie,
    setUserCookie: setUserCookie,
    loadFromToken: loadFromToken
  };
};

