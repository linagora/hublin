'use strict';

var conference = require('../../core/conference');

/**
 *
 * @param {object} dependencies
 * @return {{get: get, list: list, create: create, join: join, leave: leave, updateAttendee: updateAttendee, removeAttendee: removeAttendee, addAttendee: addAttendee, getAttendees: getAttendees}}
 */
module.exports = function(dependencies) {

  function get(req, res) {
    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }
    return res.json(200, conf);
  }

  function list(req, res) {
    conference.list(function(err, list) {
      if (err) {
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.json(200, list);
    });
  }

  function create(req, res) {
    var user = req.user;
    if (!user) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'User is missing'}});
    }

    conference.create(user, function(err, created) {
      if (err) {
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
    list: list,
    create: create,
    join: join,
    leave: leave,
    updateAttendee: updateAttendee,
    removeAttendee: removeAttendee,
    addAttendee: addAttendee,
    getAttendees: getAttendees
  };
};
