'use strict';

var conference = require('../../core/conference');
var AUTHORIZED_FIELDS = ['displayName'];

function createConference(req, callback) {
  var conf = {
    _id: req.params.id,
    history: [],
    members: []
  };

  conf.members.push(req.user);

  conference.create(conf, function(err, created) {
    if (err) {
      return callback(err);
    }

    if (!req.body.members || req.body.members.length === 0) {
      return callback(null, created);
    }

    conference.invite(created, req.user, req.body.members, function(err) {
      if (err) {
        return callback(err);
      }
      return callback(null, created);
    });
  });
}

/**
 * @param {object} dependencies
 * @return {hash}
 */
module.exports = function(dependencies) {
  var logger = dependencies('logger');

  function createAPI(req, res) {
    if (!req.user) {
      return res.json(400, {error: {code: 400, message: 'Bad request', details: 'User is required'}});
    }

    createConference(req, function(err, created) {
      if (err) {
        logger.error('Error while creating conference %e', err);
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.json(201, created);
    });
  }

  function addMembers(req, res) {
    var user = req.user;
    var conf = req.conference;

    var newMembers = req.body;
    if (!newMembers) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Invited members missing'}});
    }

    conference.invite(conf, user, newMembers, function(err) {
      if (err) {
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.send(202);
    });
  }

  function removeAttendee(req, res) {
    return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Not implemented'}});
  }

  function getMembers(req, res) {
    var conf = req.conference;
    if (!conf) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Conference is missing'}});
    }
    return res.json(200, conf.members || []);
  }

  function updateMemberField(req, res) {
    var conf = req.conference;

    var data = req.body;
    if (!data || !data.value) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Data is missing'}});
    }

    var field = req.params.field;
    if (AUTHORIZED_FIELDS.indexOf(field) < 0) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Can not update ' + field}});
    }

    conference.getMemberFromToken(req.params.mid, function(err, member) {
      if (err) {
        logger.error('Error while retrieving member from its id %e', err);
        return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Can not retrieve member'}});
      }

      if (!member) {
        return res.json(404, {error: {code: 404, message: 'Not found', details: 'Member not found in conference'}});
      }

      conference.updateMemberField(conf, member, field, data.value, function(err) {
        if (err) {
          logger.error('Can not update member %e', err);
          return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Can not update member'}});
        }
        return res.json(200, member);
      });
    });
  }

  function get(req, res) {
    if (!req.conference) {
      return res.json(404, {error: {code: 404, message: 'Not found', details: 'No such conference'}});
    }
    return res.json(200, req.conference);
  }

  return {
    get: get,
    createAPI: createAPI,
    removeAttendee: removeAttendee,
    addMembers: addMembers,
    getMembers: getMembers,
    updateMemberField: updateMemberField
  };
};
