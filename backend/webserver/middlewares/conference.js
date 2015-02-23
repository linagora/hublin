'use strict';

var conference = require('../../core/conference');

/**
 *
 * @param {object} dependencies
 * @return {{load: load, loadWithAttendees: loadWithAttendees, canJoin: canJoin, isAdmin: isAdmin, canAddAttendee: canAddAttendee}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger');

  function load(req, res, next) {
    conference.get(req.params.id, function(err, conf) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server Error',
            details: err.message
          }
        });
      }

      if (conf) {
        req.conference = conf;
      }
      return next();
    });
  }

  function loadFromMemberToken(req, res, next) {
    if (!req.query.token) {
      return res.redirect('/');
    }

    conference.getFromMemberToken(req.query.token, function(err, conf) {
      if (err) {
        logger.error('Error while getting member from token %s : %e', req.query.token, err);
        return res.send(500);
      }

      if (!conf) {
        return res.send(404);
      }

      req.conference = conf;
      return next();
    });
  }

  function loadWithAttendees(req, res, next) {
    conference.loadWithAttendees(req.params.id, function(err, conf) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server Error',
            details: err.message
          }
        });
      }

      if (!conf) {
        return res.json(404, {
          error: {
            code: 404,
            message: 'Bad request',
            details: 'conference not found: ' + req.params.id
          }
        });
      }

      req.conference = conf;
      next();
    });
  }

  function canJoin(req, res, next) {

    if (!req.user) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'User is required'
        }
      });
    }

    if (!req.conference) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'Conference is required'
        }
      });
    }

    conference.userCanJoinConference(req.conference, req.user, function(err, status) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server error',
            details: err.message
          }
        });
      }

      if (!status) {
        return res.json(403, {
          error: {
            code: 403,
            message: 'Forbidden',
            details: 'User does not have access to conference'
          }
        });
      }
      return next();
    });
  }

  function isAdmin(req, res, next) {
    if (!req.user) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'User is required'
        }
      });
    }

    if (!req.conference) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'Conference is required'
        }
      });
    }

    conference.userIsConferenceCreator(req.conference, req.user, function(err, status) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server error',
            details: err.message
          }
        });
      }

      if (!status) {
        return res.json(403, {
          error: {
            code: 403,
            message: 'Forbidden',
            details: 'User is not conference admin'
          }
        });
      }
      return next();
    });
  }


  function canAddAttendee(req, res, next) {
    if (!req.user) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'User is required'
        }
      });
    }

    if (!req.conference) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'Conference is required'
        }
      });
    }

    conference.userIsConferenceCreator(req.conference, req.user, function(err, isCreator) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server error',
            details: err.message
          }
        });
      }

      if (isCreator) {
        return next();
      }

      conference.userIsConferenceAttendee(req.conference, req.user, function(err, isAttendee) {
        if (err) {
          return res.json(500, {
            error: {
              code: 500,
              message: 'Server error',
              details: err.message
            }
          });
        }

        if (!isAttendee) {
          return res.json(403, {
            error: {
              code: 403,
              message: 'Forbidden',
              details: 'User cannot invite attendees into a conference in which he is not attendee himself.'
            }
          });
        }

        return next();
      });
    });
  }

  return {
    load: load,
    loadFromMemberToken: loadFromMemberToken,
    loadWithAttendees: loadWithAttendees,
    canJoin: canJoin,
    isAdmin: isAdmin,
    canAddAttendee: canAddAttendee
  };
};
