'use strict';

var conference = require('../../core/conference');

/**
 *
 * @param {object} dependencies
 * @return {{load: load, loadWithAttendees: loadWithAttendees, canJoin: canJoin, isAdmin: isAdmin, canAddAttendee: canAddAttendee}}
 */
module.exports = function(dependencies) {

  function load(req, res, next) {
    if (req.params.id) {
      conference.get(req.params.id, function(err, conf) {
        req.conference = conf;
        next();
      });
    } else {
      next();
    }
  }

  function loadWithAttendees(req, res, next) {
    if (req.params.id) {
      conference.loadWithAttendees(req.params.id, function(err, conf) {
        req.conference = conf;
        next();
      });
    } else {
      next();
    }
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
    loadWithAttendees: loadWithAttendees,
    canJoin: canJoin,
    isAdmin: isAdmin,
    canAddAttendee: canAddAttendee
  };
};
