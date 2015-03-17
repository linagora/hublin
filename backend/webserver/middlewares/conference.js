'use strict';

var conference = require('../../core/conference');
var conferenceHelpers = require('../../core/conference/helpers');

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

  function canUpdateUser(req, res, next) {
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
            details: 'User cannot update member in a conference he is not member'
          }
        });
      }

      if (req.user._id.toString() !== req.params.mid) {
        return res.json(403, {
          error: {
            code: 403,
            message: 'Forbidden',
            details: 'User cannot update other member.'
          }
        });
      }

      return next();
    });

  }

  function createConference(req, res, next) {
    if (req.conference) {
      return next();
    }

    var conf = {
      _id: req.params.id,
      history: [],
      members: [req.user]
    };

    conference.create(conf, function(err, created) {
      if (err) {
        return res.json(500, { error: { code: 500, message: 'Server Error', details: err.message}});
      }

      if (created) {
        req.created = true;
        req.conference = created;
      }

      if (created && created.members && created.members.length) {
        req.user = created.members[0];
      }

      next();
    });
  }

  function addUser(req, res, next) {
    if (!req.conference) {
      return next();
    }

    conference.addUser(req.conference, req.user, function(err) {
      if (err) {
        return res.json(500, { error: { code: 500, message: 'Server Error', details: err.message}});
      }
      conference.getMember(req.conference, req.user, function(err, member) {
        if (err) {
          return res.json(500, { error: { code: 500, message: 'Server Error', details: err.message}});
        }
        if (member) {
          req.user = member;
        }
        next();
      });
    });
  }

  function checkIdLength(req, res, next) {
    var confId = req.params.id;

    function returnError(errMessage) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: errMessage
        }
      });
    }

    if (conferenceHelpers.isIdTooLong(confId)) {
      return returnError('Conference id is too long');
    }

    if (conferenceHelpers.isIdTooShort(confId)) {
      return returnError('Conference id is too short');
    }

    next();
  }

  function checkIdForCreation(req, res, next) {
    var confId = req.params.id;

    if (conferenceHelpers.isIdForbidden(confId)) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: 'Forbidden conference id'
        }
      });
    }
    next();
  }

  function _lazyArchive(conf) {
    return conference.isActive(conf)
    .then(function(active) {
      if (active) {
        return false;
      }
      return conference.archive(conf);
    });
  }

  function lazyArchive(loadFirst) {
    return function(req, res, next) {

      function respond(promise) {
        promise.then(
          function(conferenceArchive) {
            if (conferenceArchive) {
              delete req.conference;
            }
            next();
          },
          function onError(err) {
            return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
          }
        )
        .done();
      }

      if (loadFirst) {
        conference.get(req.params.id, function(err, conf) {
          if (err || !conf) {
            return next();
          }
          respond(_lazyArchive(conf));
        });
      } else {
        if (!req.conference) {
          return next();
        }
        respond(_lazyArchive(req.conference));
      }
    };
  }

  return {
    load: load,
    loadFromMemberToken: loadFromMemberToken,
    loadWithAttendees: loadWithAttendees,
    canJoin: canJoin,
    isAdmin: isAdmin,
    canAddMember: canAddMember,
    canUpdateUser: canUpdateUser,
    checkIdForCreation: checkIdForCreation,
    checkIdLength: checkIdLength,
    lazyArchive: lazyArchive,
    createConference: createConference,
    addUser: addUser
  };
};
