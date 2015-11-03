'use strict';

var mongoose = require('mongoose'),
    Conference = mongoose.model('Conference'),
    ConferenceArchive = mongoose.model('ConferenceArchive'),
    localpubsub = require('../pubsub').local,
    globalpubsub = require('../pubsub').global,
    logger = require('../logger'),
    extend = require('extend'),
    q = require('q'),
    async = require('async'),
    scale = require('./scalability');

var TTL = 1000 * 60 * 10;
var GARBAGE_TTL = 1000 * 60 * 60 * 24;

var MEMBER_STATUS = {
  INVITED: 'invited',
  ONLINE: 'online',
  OFFLINE: 'offline'
};

var EVENTS = {
  join: 'conference:join',
  leave: 'conference:leave',
  invite: 'conference:invite',
  create: 'conference:create'
};

/**
 * Create a new conference in Mongo
 * @param {object} conference
 * @param {function} callback
 * @return {*}
 */
function create(conference, callback) {
  if (!conference) {
    return callback(new Error('Conference can not be null'));
  }

  scale(conference, function(err, conference) {
    if (err) {
      return callback(err);
    }

    return new Conference(conference).save(function(err, conference) {
      if (err) {
        return callback(err);
      }

      localpubsub
        .topic(EVENTS.create)
        .forward(globalpubsub, {
          conference: conference,
          user: conference.members[0]
        });

      return callback(err, conference);
    });
  });
}

/**
 * Update the history property of a conference, meaning that we add an action for a user.
 * @param {string} conference
 * @param {string} user
 * @param {string} status - can be creation||join||leave
 * @param {function} callback
 * @return {*}
 */
function addHistory(conference, user, status, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference || !conference._id) {
    return callback(new Error('Undefined or invalid conference'));
  }

  if (!status) {
    return callback(new Error('Undefined status'));
  }

  Conference.update(
    { _id: conference._id },
    {
      $push: {
        history: {
          verb: 'event',
          target: [{
            objectType: 'conference',
            _id: conference._id
          }],
          object: {
            objectType: 'event',
            _id: status
          },
          actor: {
            objectType: user.objectType || 'hublin:anonymous',
            _id: user.id,
            displayName: user.displayName || ''
          }
        }
      }
    },
    { upsert: false },
    callback
  );
}

/**
 * Get a member from a conference based on its tuple data
 *
 * @param {Conference} conference
 * @param {Tuple} tuple
 * @param {Function} callback
 * @return {*}
 */
function getMember(conference, tuple, callback) {
  Conference.findOne(
    {_id: conference._id},
    {members: {$elemMatch: {id: tuple.id, objectType: tuple.objectType}}}
  ).exec(function(err, conf) {
      if (err) {
        return callback(err);
      }

      if (!conf || !conf.members || conf.members.length === 0) {
        return callback(new Error('No such user'));
      }
      return callback(null, conf.members[0]);
    });
}

/**
 * Send invitation to one member
 *
 * @param {Conference} conference
 * @param {Member} creator
 * @param {Member} member
 * @param {string} baseUrl - The conference server URL
 * @param {Function} callback
 * @return {*}
 */
function sendInvitation(conference, creator, member, baseUrl, callback) {
  var localtopic = localpubsub.topic(EVENTS.invite);

  getMember(conference, member, function(err, m) {
    if (err) {
      return callback(err);
    }

    if (!m) {
      return callback(new Error('No such member found'));
    }

    var invitation = {
      conference: conference,
      user: m,
      creator: creator,
      baseUrl: baseUrl
    };
    localtopic.forward(globalpubsub, invitation);
    return callback();
  });
}

/**
 * Invite a list of members inside a conference
 * @param {string} conference
 * @param {string} creator - user inviting into the conference
 * @param {[member]} members - an array of members
 * @param {string} baseUrl - The conference server URL
 * @param {function} callback
 * @return {*}
 */
function invite(conference, creator, members, baseUrl, callback) {
  if (!conference) {
    return callback(new Error('Can not invite to an undefined conference'));
  }

  if (!members) {
    return callback(new Error('Can not invite undefined members'));
  }

  if (!Array.isArray(members)) {
    return callback(new Error('members parameter should be an array'));
  }

  members.forEach(function(member) {
    var confMember = {};
    extend(true, confMember, member);

    if (!confMember.displayName) {
      confMember.displayName = confMember.id;
    }
    confMember.status = MEMBER_STATUS.INVITED;
    conference.members.push(confMember);
  });

  conference.save(function(err, updated) {
    if (err) {
      return callback(err);
    }

    async.each(members, function(member, callback) {
      sendInvitation(updated, creator, member, baseUrl, function(err) {
        if (err) {
          logger.error('Error while sending invitation to', member, err);
        }
        return callback();
      });
    }, function() {
      return callback(null, updated);
    });
  });
}

/**
 * Get a conference by its id
 * @param {string} id
 * @param {function} callback
 * @return {*}
 */
function get(id, callback) {
  return Conference.findOne({_id: id}, callback);
}

/**
 * Get conference from a member token
 *
 * @param {String} token
 * @param {Function} callback
 */
function getFromMemberToken(token, callback) {
  Conference.findOne({'members.token': token}).exec(callback);
}

/**
 * @param {String} token
 * @param {Function} callback
 * @return {*}
 */
function getMemberFromToken(token, callback) {
  getFromMemberToken(token, function(err, conference) {
    if (err) {
      return callback(err);
    }
    if (!conference) {
      return callback();
    }
    var member = conference.members.filter(function(member) {
      return member.token === token;
    });
    return callback(null, member[0]);
  });
}

/**
 * Update member field in a conference
 *
 * @param {Conference} conference
 * @param {Member} member
 * @param {String} field
 * @param {String} value
 * @param {Function} callback
 * @return {*}
 */
function updateMemberField(conference, member, field, value, callback) {
  var update = {displayName: {$set: {'members.$.displayName': value}}};
  if (!update[field]) {
    return callback(new Error('Can not update the field', field));
  }
  Conference.update(
    {_id: conference._id, members: {$elemMatch: {id: member.id, objectType: member.objectType}}},
    update[field],
    {upsert: true},
    callback
  );
}

/**
 * Load a conference with its attendees
 * @param {string} id
 * @param {function} callback
 */
function loadWithAttendees(id, callback) {
  Conference.findById(id).sort('-timestamps.creation').populate('attendees.user', null, 'User').exec(callback);
}

/**
 * List all conferences by create date. It also populate creators
 * @param {function} callback
 */
function list(callback) {
  Conference.find().sort('-timestamps.creation').populate('creator', null, 'User').exec(callback);
}

/**
 * Check if user is the creator of conference
 * @param {string} conference
 * @param {string} user
 * @param {function} callback
 * @return {*}
 */
function userIsConferenceCreator(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }
  return callback(null, conference.creator.equals(user._id));
}

/**
 * Check is user is one of the conference members
 * @param {string} conference
 * @param {string} user
 * @param {function} callback
 * @return {*}
 */
function userIsConferenceMember(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }
  Conference.findOne({_id: conference._id}, {members: {$elemMatch: {id: user.id, objectType: user.objectType}}}).exec(function(err, conf) {
    if (err) {
      return callback(err);
    }
    return callback(null, (conf && conf.members !== null && conf.members.length > 0));
  });
}

/**
 * Check if user can join conference.
 * Conferences are public for now so everybody can join.
 * @param {string} conference
 * @param {string} user
 * @param {function} callback
 * @return {*}
 */
function userCanJoinConference(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  return callback(null, true);
}

/**
 * Add user to the conference if not already in
 *
 * @param {Conference} conference
 * @param {User} user
 * @param {Function} callback
 * @return {*}
 */
function addUser(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  get(conference._id, function(err, conf) {
    if (err) {
      return callback(err);
    }

    if (!conf) {
      return callback(new Error('No such conference', conference._id));
    }

    userIsConferenceMember(conference, user, function(err, isMember) {
      if (err) {
        return callback(err);
      }

      if (isMember) {
        return callback();
      }

      user.status = user.status || MEMBER_STATUS.OFFLINE;
      user.displayName = user.displayName || user.id;

      conf.members.push(user);
      return conf.save(callback);
    });
  });
}

/**
 * Join a conference sets the member if not in list, sets member status to online and adds history
 *
 * @param {Conference} conference
 * @param {User} user
 * @param {function} callback
 * @return {*}
 */
function join(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

   addUser(conference, user, function(err) {
    if (err) {
      return callback(err);
    }
    Conference.update(
      {_id: conference._id, members: {$elemMatch: {id: user.id, objectType: user.objectType}}},
      {$set: {'members.$.status': MEMBER_STATUS.ONLINE}},
      {upsert: true},
      function(err, updated) {
        if (err) {
          logger.error('Error while updating the conference', err);
          return callback(err);
        }

        localpubsub.topic(EVENTS.join).forward(globalpubsub, {conference: conference, user: user});

        return callback(null, updated);
    });
  });
}

/**
 * Leave a conference sets member status to offline and adds history
 *
 * @param {Conference} conference
 * @param {Tuple} user
 * @param {function} callback
 * @return {*}
 */
function leave(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  userIsConferenceMember(conference, user, function(err, isMember) {
    if (err) {
      return callback(err);
    }

    if (!isMember) {
      return callback(new Error('User is not member of this conference'));
    }
    Conference.update(
      {_id: conference._id, members: {$elemMatch: {id: user.id, objectType: user.objectType}}},
      {$set: {'members.$.status': MEMBER_STATUS.OFFLINE}},
      {upsert: true},
      function(err, updated) {
        if (err) {
          return callback(err);
        }

        localpubsub.topic(EVENTS.leave).forward(globalpubsub, {conference: conference, user: user});

        return callback(null, updated);
    });
  });
}

/**
 * Hook for room join event called from om-webrtc module
 *
 * @param {String} roomId
 * @param {String} userId
 * @param {Function} callback
 * @return {*}
 */
function onRoomJoin(roomId, userId, callback) {
  get(roomId, function(err, conference) {
    if (err) {
      logger.error('Error while getting room', err);
      return callback(new Error('Error while getting conference from room'));
    }

    if (!conference) {
      logger.info('Can not find conference from room', roomId);
      return callback(new Error('Can not find conference from room', roomId));
    }

    var user = conference.members.id(userId);
    if (!user) {
      logger.info('No valid user found for room %s with id %s', roomId, userId);
      return callback();
    }

    return join(conference, user, callback);
  });
}

/**
 * Hook for room leave event called from om-webrtc module
 *
 * @param {String} roomId
 * @param {String} userId
 * @param {Function} callback
 * @return {*}
 */
function onRoomLeave(roomId, userId, callback) {
  get(roomId, function(err, conference) {
    if (err) {
      logger.error('Error while getting room %s', roomId, err);
      return callback(new Error('Error while getting conference from room', roomId));
    }

    if (!conference) {
      logger.info('Can not find conference from room %s', roomId);
      return callback(new Error('Can not find conference from room', roomId));
    }

    var user = conference.members.id(userId);
    if (!user) {
      logger.info('No valid user found for room %s with id %s', roomId, userId);
      return callback();
    }

    return leave(conference, user, callback);
  });
}

/**
 * get garbage time to live of a conference
 *
 * @return {Promise} fullfilled with the conference GARBAGE_TTL
 */
function getGarbageTTL() {
  return q(GARBAGE_TTL);
}

/**
 * get time to live of a conference
 *
 * @return {Promise} fullfilled with the conference TTL
 */
function getTTL() {
  return q(TTL);
}


/**
 * tell if a conference is active.
 *
 * A conference can be not active for two reasons:
 * - when no member is in state MEMBER_STATUS.ONLINE , and the conference is older than ttl.
 * - when the last history entry is older than garbage ttl
 *
 * @param {Conference} conference to check for active state
 * @return {Promise} fullfilled with a boolean telling whether the conference is still active
 */
function isActive(conference) {

  function _isActive(ttls) {
    var ttl = ttls[0],
        garbageTTL = ttls[1];
    function memberOnline(member) {
      return member.status === MEMBER_STATUS.ONLINE;
    }
    function ttlNotExpired(creationDate) {
      var diff = Date.now() - creationDate.getTime() - ttl;
      return diff < 0;
    }
    function garbageTtlNotReached(conference) {
      if (!conference.history ||   !conference.history.length) {
        return true;
      }
      var latestActivity = conference.history[(conference.history.length - 1)];
      var diff = Date.now() - latestActivity.published.getTime() - garbageTTL;
      return diff < 0;
    }

    var active = garbageTtlNotReached(conference) &&
        (conference.members.some(memberOnline) || ttlNotExpired(conference.timestamps.created));
    return q(active);
  }

  return q.all([getTTL(), getGarbageTTL()])
  .then(_isActive);
}

function _buildConferenceArchive(conference) {
  var initial_id = conference._id;
  var jsonConference = conference.toObject();
  delete jsonConference._id;
  jsonConference.initial_id = initial_id;
  jsonConference.timestamps.archived = new Date();

  return new ConferenceArchive(jsonConference);
}

/**
 * archive a conference
 *
 * this create a ConferenceArchive, and removes the
 * conference.
 *
 * @param {Conference} conference to remove
 * @return {Promise} fullfilled with the conferenceArchive mongoose document
 */
function archive(conference) {
  var deferred = q.defer();
  var ca = _buildConferenceArchive(conference);

  ca.save(function(err, conferenceArchive) {
    if (err) {
      logger.error('Unable to save conference archive %s', ca.toObject(), err);
      return deferred.reject(err);
    }
    Conference.remove({_id: conferenceArchive.initial_id}, function(err) {
      if (err) {
        logger.error('Unable to remove inactive conference', err);
        return deferred.reject(err);
      }
      logger.debug('conference ' + conferenceArchive.initial_id + ' has been archived, archive _id=' + conferenceArchive._id);
      return deferred.resolve(conferenceArchive);
    });
  });
  return deferred.promise;
}

/**
 * @type {create}
 */
module.exports.create = create;
/**
 * @type {addHistory}
 */
module.exports.addHistory = addHistory;
/**
 * @type {invite}
 */
module.exports.invite = invite;

/**
 * @type {sendInvitation}
 */
module.exports.sendInvitation = sendInvitation;

/**
 * @type {get}
 */
module.exports.get = get;

/**
 * @type {getFromMemberToken}
 */
module.exports.getFromMemberToken = getFromMemberToken;

/**
 * @type {getMemberFromToken}
 */
module.exports.getMemberFromToken = getMemberFromToken;

/**
 * @type {loadWithAttendees}
 */
module.exports.loadWithAttendees = loadWithAttendees;
/**
 * @type {list}
 */
module.exports.list = list;
/**
 * @type {userIsConferenceCreator}
 */
module.exports.userIsConferenceCreator = userIsConferenceCreator;
/**
 * @type {function}
 */
module.exports.userIsConferenceMember = userIsConferenceMember;
/**
 * @type {userCanJoinConference}
 */
module.exports.userCanJoinConference = userCanJoinConference;
/**
 * @type {join}
 */
module.exports.join = join;
/**
 *
 * @type {onRoomJoin}
 */
module.exports.onRoomJoin = onRoomJoin;
/**
 *
 * @type {onRoomLeave}
 */
module.exports.onRoomLeave = onRoomLeave;
/**
 * @type {leave}
 */
module.exports.leave = leave;

/**
 * @type {getMember}
 */
module.exports.getMember = getMember;

/**
 * @type {addUser}
 */
module.exports.addUser = addUser;

/**
 * @type {updateMemberField}
 */
module.exports.updateMemberField = updateMemberField;

/**
 * @type {{join: string, leave: string}}
 */
module.exports.EVENTS = EVENTS;

/**
 * @type {hash} The possible statuses for conference members
 */
module.exports.MEMBER_STATUS = MEMBER_STATUS;

/**
 * @type {Function}
 */
module.exports.isActive = isActive;

/**
 * @type {Function}
 */
module.exports.archive = archive;

/**
 * @type {Function}
 */
module.exports.getTTL = getTTL;
