'use strict';

var conference = require('../../core/conference');
var AUTHORIZED_FIELDS = ['displayName'];
var extend = require('extend');

var Report = require('../../core/report');

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

function _transformConferenceMember(member) {
  var sanitizedMember = {
    objectType: member.objectType,
    _id: member._id,
    displayName: member.displayName,
    status: member.status
  };
  return sanitizedMember;
}

function _transformConferenceMembers(members) {
  return members.map(_transformConferenceMember);
}

function _transformConference(conference) {
  var sanitizedConference = extend(true, {}, conference);
  delete sanitizedConference.history;
  if (conference.members) {
    sanitizedConference.members = _transformConferenceMembers(sanitizedConference.members);
  }
  return sanitizedConference;
}

function inviteMembers(conf, user, members, callback) {
  var newMembers = [];

  if (!Array.isArray(members)) {
    var err = new Error('Members must be an array');
    err.code = 1;
    return callback(err);
  }

  members.forEach(function(member) {
    var sanitizedMember = _sanitizeAndValidateMember(member);
    if (sanitizedMember) {
      newMembers.push(sanitizedMember);
    }
  });

  if (!newMembers) {
    var missing = new Error('Invited members missing');
    missing.code = 2;
    return callback(missing);
  }

  conference.invite(conf, user, newMembers, callback);
}

function errorResponse(err, res) {
  if (err.code) {
    return res.json(400, {error: {code: 400, message: 'Bad Request', details: err.message}});
  } else {
    return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
  }
}

module.exports = function(dependencies) {
  var logger = dependencies('logger');

  function addMembers(req, res) {
    inviteMembers(req.conference, req.user, req.body, function(err) {
      if (err) {
        return errorResponse(err, res);
      }
      res.send(202);
    });
  }

  function finalizeCreation(req, res) {

    if (!req.body.members || req.body.members.length === 0) {
      return res.json(req.created ? 201 : 200, _transformConference(req.conference.toObject()));
    }

    inviteMembers(req.conference, req.user, req.body.members, function(err) {
      if (err) {
        return errorResponse(err, res);
      }
      return res.send(202, _transformConference(req.conference.toObject()));
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
    var sanitizedMembers = conf.members ? _transformConferenceMembers(conf.toObject().members) : [];
    return res.json(200, sanitizedMembers);
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
        return res.json(500, {error: {code: 500, message: 'Server Error', details: 'Can not update member'}});
      }
      var returnedMember = member[0].toObject();
      returnedMember[field] = data.value;
      return res.json(200, _transformConferenceMember(returnedMember));
    });
  }

  function get(req, res) {
    if (!req.conference) {
      return res.json(404, {error: {code: 404, message: 'Not found', details: 'No such conference'}});
    }
    return res.json(200, _transformConference(req.conference.toObject()));
  }

  function persistReport(req, callback) {
    var reportToSave = {
      timestamp: {created: new Date()},
      reporter: req.user,
      description: req.body.description,
      conference: req.conference
    };

    reportToSave.members = [];
    var mapMembers = {};

    for (var i = 0; i < req.conference.members.length; i++) {
      mapMembers[req.conference.members[i]._id.toString()] = req.conference.members[i];
    }
    reportToSave.reported = mapMembers[req.body.reported];
    req.body.members.forEach(function(memberId) {
      reportToSave.members.push(mapMembers[memberId]);
    });

    return Report.create(reportToSave, callback);
  }

  function createReport(req, res) {

    if (!req.body.reported) {
      return res.json(400, {error: {code: 400, message: 'Bad request', details: 'Attendee to report is required'}});
    }

    if (!req.body.description) {
      return res.json(400, {error: {code: 400, message: 'Bad request', details: 'Description is required'}});
    }

    if (!req.body.members) {
      return res.json(400, {error: {code: 400, message: 'Bad request', details: 'Members of the conference are required'}});
    }

    persistReport(req, function(err, created) {
      if (err) {
        logger.error('Error while creating report %e', err);
        return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message}});
      }

      return res.json(201, {id: created._id});
    });
  }

  return {
    get: get,
    finalizeCreation: finalizeCreation,
    removeAttendee: removeAttendee,
    addMembers: addMembers,
    getMembers: getMembers,
    updateMemberField: updateMemberField,
    createReport: createReport
  };
};
