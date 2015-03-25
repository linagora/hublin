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
  var errors = require('../errors')(dependencies);

  /**
   * Ensures that req.user and req.conference is set, throwing a
   * BadRequestError otherwise.
   *
   * @param {Request} req       The request to check
   */
  function ensureUserAndConference(req) {
    if (!req.user) {
      throw new errors.BadRequestError('User is required');
    }

    if (!req.conference) {
      throw new errors.BadRequestError('Conference is required');
    }
  }

  function load(req, res, next) {
    conference.get(req.params.id, function(err, conf) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (conf) {
        req.conference = conf;
      }
      next();
    });
  }

  function loadFromMemberToken(req, res, next) {
    if (!req.query.token) {
      return next();
    }

    conference.getFromMemberToken(req.query.token, function(err, conf) {
      if (err) {
        logger.error('Error while getting member from token %s', req.query.token, err);
        throw new errors.ServerError('Error retrieving member');
      }

      if (!conf) {
        throw new errors.NotFoundError('Conference not found');
      }

      req.conference = conf;
      next();
    });
  }

  function loadWithAttendees(req, res, next) {
    conference.loadWithAttendees(req.params.id, function(err, conf) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!conf) {
        throw new errors.NotFoundError('Conference not found');
      }

      req.conference = conf;
      next();
    });
  }

  function canJoin(req, res, next) {
    ensureUserAndConference(req);

    conference.userCanJoinConference(req.conference, req.user, function(err, status) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!status) {
        throw new errors.ForbiddenError('User does not have access to conference');
      }
      next();
    });
  }

  function isAdmin(req, res, next) {
    ensureUserAndConference(req);

    conference.userIsConferenceCreator(req.conference, req.user, function(err, status) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!status) {
        throw new errors.ForbiddenError('User is not conference admin');
      }
      next();
    });
  }

  function canAddMember(req, res, next) {
    ensureUserAndConference(req);

    conference.userIsConferenceMember(req.conference, req.user, function(err, isMember) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!isMember) {
        throw new errors.ForbiddenError('User cannot invite members into a conference in which he is not member himself');
      }

      next();
    });
  }

  function canUpdateUser(req, res, next) {
    ensureUserAndConference(req);

    conference.userIsConferenceMember(req.conference, req.user, function(err, isMember) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!isMember) {
        throw new errors.ForbiddenError('User cannot update member in a conference he is not member');
      }

      if (req.user._id.toString() !== req.params.mid) {
        throw new errors.ForbiddenError('User cannot update other member');
      }

      next();
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
        throw new errors.ServerError(err);
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
        throw new errors.ServerError(err);
      }
      conference.getMember(req.conference, req.user, function(err, member) {
        if (err) {
          throw new errors.ServerError(err);
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

    if (conferenceHelpers.isIdTooLong(confId)) {
      throw new errors.BadRequestError('Conference id is too long');
    }

    if (conferenceHelpers.isIdTooShort(confId)) {
      throw new errors.BadRequestError('Conference id is too short');
    }

    next();
  }

  function checkIdForCreation(req, res, next) {
    var confId = req.params.id;

    if (conferenceHelpers.isIdForbidden(confId)) {
      throw new errors.BadRequestError('Forbidden conference id');
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
            throw new errors.ServerError(err);
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
