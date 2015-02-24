'use strict';

var conference = require('../../core/conference');
var invitation = {

  /**
   * Send invitation to users, update the conference by calling core.conference#invite
   * Note: This can be handled asynchronously by a task runner.
   *
   * @param {Conference} conference
   * @param {Array} users
   * @param {Function} callback
   * @return {*}
   */
  inviteUsers: function(conference, users, callback) {
    return callback(null, conference);
  }
};

function createConference(req, callback) {

  var conf = {
    _id: req.params.id,
    history: [],
    members: []
  };

  if (req.query.displayName) {
    var currentUser = {
      objectType: 'hublin:anonymous',
      id: 'creator',
      displayName: req.query.displayName,
      connection: {
        ipAdress: '',
        userAgent: req.headers['user-agent']
      }
    };
    conf.members.push(currentUser);
  }

  conference.create(conf, function(err, created) {
    if (err) {
      return callback(err);
    }

    var members = req.body.members || [];
    return invitation.inviteUsers(created, members, callback);
  });
}

/**
 * @param {object} dependencies
 * @return {hash}
 */
module.exports = function(dependencies) {
  var logger = dependencies('logger');

  function get(req, res) {
    var conf = req.conference;
    if (!conf) {
      return createConference(req, function(err, created) {
        if (err) {
          logger.error('Error while creating conference %e', err);
          return res.send(500);
        }
        return res.redirect('/' + created._id);
      });
    }
    return res.redirect('/' + req.conference._id);
  }

  function create(req, res) {
    return createConference(req, function(err, created) {
      if (err) {
        logger.error('Error while creating conference %e', err);
        return res.send(500);
      }
      return res.redirect('/' + created.id);
    });
  }

  function createAPI(req, res) {
    createConference(req, function(err, created) {
      if (err) {
        logger.error('Error while creating conference %e', err);
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.json(201, created);
    });
  }

  function join(req, res) {
    var user = req.user;
    if (!user) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'User is missing'}});
    }

    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }

    conference.join(conf, user, function(err, updated) {
      if (err) {
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.json(204);
    });
  }

  function leave(req, res) {
    return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Not implemented yet'}});
  }

  function updateAttendee(req, res) {
    var user = req.user;
    if (!user) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'User is missing'}});
    }

    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }

    if (!req.param('action')) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Action is missing'}});
    }

    var action = req.param('action');
    if (action === 'join') {
      return join(req, res);
    } else if (action === 'leave') {
      return leave(req, res);
    } else {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Unknown action'}});
    }
  }

  function addAttendee(req, res) {
    var user = req.param('user_id');
    if (!user) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'User is missing'}});
    }

    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }

    conference.invite(conf, user, function(err, updated) {
      if (err) {
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.send(204);
    });
  }

  function removeAttendee(req, res) {
    return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Not implemented'}});
  }

  function getAttendees(req, res) {
    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }

    if (!conf.attendees || conf.attendees.length === 0) {
      return res.json(200, []);
    }

    var users = conf.attendees.map(function(entry) {
      var user = entry.user.toObject();
      delete user.password;
      return user;
    });

    return res.json(200, users);
  }

  return {
    get: get,
    create: create,
    createAPI: createAPI,
    join: join,
    leave: leave,
    updateAttendee: updateAttendee,
    removeAttendee: removeAttendee,
    addAttendee: addAttendee,
    getAttendees: getAttendees
  };
};
