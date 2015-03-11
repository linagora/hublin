'use strict';

var conference = require('../../core/conference');
var AUTHORIZED_FIELDS = ['displayName'];

function _sanitizeAndValidateMember(member) {
  if (!member.objectType || !member.id) {
    return false;
  }
  var sanitizedMember = {
    objectType: member.objectType,
    id: member.id,
    displayName: member.displayName ? member.displayName : member.id
  };
  return sanitizedMember;
}


/**
 * @param {object} dependencies
 * @return {hash}
 */
module.exports = function(dependencies) {
  var logger = dependencies('logger');

  function addMembers(req, res) {
    var user = req.user;
    var conf = req.conference;

    var newMembers = [];

    if (!Array.isArray(req.body)) {
      return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'request payload should be an array'}});
    }

    req.body.forEach(function(member) {
      var sanitizedMember = _sanitizeAndValidateMember(member);
      if (sanitizedMember) {
        newMembers.push(sanitizedMember);
      }
    });

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

  function createdOrUpdated(req, res) {

    function isInviteRequest() {
      return req.body.members && req.body.members.length > 0;
    }

    if (!req.created) {
      if (isInviteRequest()) {
        return res.json(400, {error: {code: 400, message: 'Bad Request', details: 'Can not invite members using this endpoint. Check the dev documentation'}});
      }
      return res.json(200, req.conference);
    }

    if (!isInviteRequest()) {
      return res.json(201, req.conference);
    }

    var invitedMembers = [];

    if (req.body.members && req.body.members.length) {
      req.body.members.forEach(function(member) {
        var sanitizedMember = _sanitizeAndValidateMember(member);
        if (!sanitizedMember) {
          logger.warn('member is invalid:  %j', member);
        } else {
          invitedMembers.push(member);
        }
      });
    }

    conference.invite(req.conference, req.user, invitedMembers, function(err) {
      if (err) {
        logger.error('Error while inviting members', err);
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }
      return res.send(202, req.conference);
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

    var memberId = req.params.mid;
    var member = conf.members.filter(function(member) {
      return member._id.toString() === memberId;
    });

    if (!member.length) {
      return res.json(404, {error: {code: 404, message: 'Not found', details: 'Member not found in conference'}});
    }

    conference.updateMemberField(conf, member[0], field, data.value, function(err) {
      if (err) {
        logger.error('Can not update member %e', err);
        return res.json(500, {error: {code: 500, message: 'Can not update member', details: err.message}});
      }
      member[0][field] = data.value;
      return res.json(200, member);
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
    createdOrUpdated: createdOrUpdated,
    removeAttendee: removeAttendee,
    addMembers: addMembers,
    getMembers: getMembers,
    updateMemberField: updateMemberField
  };
};
