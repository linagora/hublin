'use strict';

var conference = require('../../core/conference');
var uuid = require('node-uuid');

/**
 *
 * @param {Dependencies} dependencies
 * @return {Object}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger');
  var errors = require('../errors')(dependencies);

  /**
   * Augment the request object to forward req.user to the session data for the
   * given conference id.
   *
   * @param {Request} req           The request being processed.
   * @param {String} conferenceId   The id of the conference to access.
   */
  function setupRequestUser(req, conferenceId) {
    // Make sure that changing req.user also updates the session.
    Object.defineProperty(req, 'user', {
      configurable: true,
      get: function() {
        return this.session.conferenceToUser[conferenceId];
      },
      set: function(val) {
        if (!req.session.conferenceToUser) {
          this.session.conferenceToUser = {};
        }
        this.res.cookie('user', JSON.stringify(val));
        this.res.header('X-Hublin-Token', val.token);
        return (this.session.conferenceToUser[conferenceId] = val);
      }
    });
  }

  /**
   * Loads the user for the conference provided by the :id param. If the
   * conference doesn't exist, a new one is created.
   *
   * Requires the following request details:
   *   - req.params.id          The conference id
   *   - req.query.displayName  (optional) Display name for the user in this
   *                              conference
   *
   * @param {Request} req       The request being processed
   * @param {Response} res      The response being processed
   * @param {Function} next     The next handler to call
   */
  function createForConference(req, res, next) {
    var conferenceId = req.params.id;
    setupRequestUser(req, conferenceId);

    if (!req.session.conferenceToUser || !(conferenceId in req.session.conferenceToUser)) {
      var user = {
        objectType: 'hublin:anonymous',
        id: uuid.v4(),
        token: uuid.v4(),
        displayName: req.query.displayName || 'anonymous',
        connection: {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      };

      req.user = user;
    }

    next();
  }

  /**
   * Loads the user for the conference provided by the :id param.
   *
   * Requires the following request details:
   *   - req.params.id          The conference id
   *
   * @param {Request} req       The request being processed
   * @param {Response} res      The response being processed
   * @param {Function} next     The next handler to call
   */
  function loadForConference(req, res, next) {
    if (!req.params.id) {
      throw new errors.NotFoundError('Conference not found');
    }

    var conferenceId = req.params.id;
    if (!req.session.conferenceToUser || !(conferenceId in req.session.conferenceToUser)) {
      throw new errors.ForbiddenError('Access to user data denied');
    }

    setupRequestUser(req, conferenceId);

    next();
  }

  /**
   * Loads the user from the token query parameter and sets up the session with
   * the user.
   *
   * Requires the following request details:
   *   - req.query.token        The member id token
   *
   * @param {Request} req       The request being processed
   * @param {Response} res      The response being processed
   * @param {Function} next     The next handler to call
   */
  function loadFromToken(req, res, next) {
    var token = req.query.token;

    if (!token) {
      next();
      return;
    }

    conference.getFromMemberToken(token, function(err, conference) {
      if (err) {
        logger.error('Can not get member from token', err);
        return res.send(500);
      }

      if (!conference) {
        return res.send(404);
      }

      var members = conference.members.filter(function(member) {
        return member.token === token;
      });

      if (!members.length) {
        return res.send(404);
      }

      setupRequestUser(req, conference._id);
      req.user = members[0];

      next();
    });
  }

  return {
    loadForConference: loadForConference,
    createForConference: createForConference,
    loadFromToken: loadFromToken
  };
};
