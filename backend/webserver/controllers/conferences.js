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
module.exports = function(dependencies) {
  var logger = dependencies('logger');
  var errors = require('../errors')(dependencies);

  function inviteMembers(conf, user, members, baseUrl, callback) {
    var newMembers = [];

    if (!Array.isArray(members)) {
      throw new errors.BadRequestError('Members must be an array');
    }

    members.forEach(function(member) {
      var sanitizedMember = _sanitizeAndValidateMember(member);
      if (sanitizedMember) {
        newMembers.push(sanitizedMember);
      }
    });

    if (!newMembers) {
      throw new errors.BadRequestError('Invited members missing');
    }

    conference.invite(conf, user, newMembers, baseUrl, callback);
  }

  function addMembers(req, res) {
    inviteMembers(req.conference, req.user, req.body, req.openpaas.getBaseURL(), function(err) {
      if (err) {
        throw new errors.ServerError(err);
      }
      res.send(202);
    });
  }

  function finalizeCreation(req, res) {

    if (!req.body.members || req.body.members.length === 0) {
      return res.json(req.created ? 201 : 200, _transformConference(req.conference.toObject()));
    }

    inviteMembers(req.conference, req.user, req.body.members, req.openpaas.getBaseURL(), function(err) {
      if (err) {
        throw new errors.ServerError(err);
      }
      res.send(202, _transformConference(req.conference.toObject()));
    });
  }

  function getMembers(req, res) {
    var conf = req.conference;
    if (!conf) {
      throw new errors.BadRequestError('Conference is missing');
    }
    var sanitizedMembers = conf.members ? _transformConferenceMembers(conf.toObject().members) : [];
    res.json(200, sanitizedMembers);
  }

  function updateMemberField(req, res) {
    var conf = req.conference;

    var data = req.body;
    if (!data || !data.value) {
      throw new errors.BadRequestError('Data is missing');
    }

    var field = req.params.field;
    if (AUTHORIZED_FIELDS.indexOf(field) < 0) {
      throw new errors.BadRequestError('Can not update ' + field);
    }

    var memberId = req.params.mid;
    var member = conf.members.filter(function(member) {
      return member._id.toString() === memberId;
    });

    if (!member.length) {
      throw new errors.NotFoundError('Member not found in conference');
    }

    conference.updateMemberField(conf, member[0], field, data.value, function(err) {
      if (err) {
        logger.error('Can not update member', err);
        throw new errors.ServerError('Can not update member');
      }
      var returnedMember = member[0].toObject();
      returnedMember[field] = data.value;
      var user = req.user;
      user[field] = data.value;
      req.user = user;
      res.json(200, _transformConferenceMember(returnedMember));
    });
  }

  function get(req, res) {
    if (!req.conference) {
      throw new errors.NotFoundError('No such conference');
    }
    res.json(200, _transformConference(req.conference.toObject()));
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
      throw new errors.BadRequestError('Attendee to report is required');
    }

    if (!req.body.description) {
      throw new errors.BadRequestError('Description is required');
    }

    if (!req.body.members) {
      throw new errors.BadRequestError('Members of the conference are required');
    }

    persistReport(req, function(err, created) {
      if (err) {
        logger.error('Error while creating report', err);
        throw new errors.ServerError(err);
      }

      res.json(201, {id: created._id});
    });
  }

  return {
    get: get,
    finalizeCreation: finalizeCreation,
    addMembers: addMembers,
    getMembers: getMembers,
    updateMemberField: updateMemberField,
    createReport: createReport
  };
};
