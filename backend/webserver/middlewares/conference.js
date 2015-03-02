'use strict';

var conference = require('../../core/conference');
var async = require('async');

/**
 *
 * @param {object} dependencies
 * @return {{load: load, loadWithAttendees: loadWithAttendees, canJoin: canJoin, isAdmin: isAdmin, canAddMember: function}}
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
      return next();
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


  function canAddMember(req, res, next) {
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

    conference.userIsConferenceMember(req.conference, req.user, function(err, isMember) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server error',
            details: err.message
          }
        });
      }

      if (!isMember) {
        return res.json(403, {
          error: {
            code: 403,
            message: 'Forbidden',
            details: 'User cannot invite members into a conference in which he is not member himself.'
          }
        });
      }

      return next();
    });
  }

  function joinOrCreate(req, res, next) {

    function createConference(id, firstUser, callback) {
      var conf = {
        _id: id,
        history: [],
        members: [firstUser]
      };

      conference.create(conf, function(err, created) {
        if (created) {
          req.user = created.members[0];
        }
        return callback(err, created);
      });
    }

    function joinOrCreateConf(conf, callback) {
      if (conf) {
        logger.debug('A conference', conf, 'has been found, joining it.');
        return conference.join(conf, req.user, function(err, joined) {
          if (joined) {
            return conference.getMember(joined, req.user, function(err, member) {
              if (!err && member) {
                req.user = member;
              }
              return callback(null, joined);
            });
          }
          return callback(err, joined);
        });
      }
      logger.debug('Conference of id %s not found. Creating a new one.', req.params.id);
      createConference(req.params.id, req.user, callback);
    }

    async.waterfall([
      conference.get.bind(null, req.params.id),
      joinOrCreateConf
    ], function(err, result) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server Error',
            details: err.message
          }
        });
      }

      next();
    });
  }

  return {
    load: load,
    loadFromMemberToken: loadFromMemberToken,
    loadWithAttendees: loadWithAttendees,
    canJoin: canJoin,
    isAdmin: isAdmin,
    canAddMember: canAddMember,
    joinOrCreate: joinOrCreate
  };
};
