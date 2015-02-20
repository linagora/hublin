'use strict';

var mongoose = require('mongoose');
var Conference = mongoose.model('Conference');
var localpubsub = require('../pubsub').local;
var globalpubsub = require('../pubsub').global;
var logger = require('../logger');

/**
 * Create a new conference in Mongo
 * @param {string} user
 * @param {function} callback
 * @return {*}
 */
function create(user, callback) {
  if (!user || !user._id) {
    return callback(new Error('Creator can not be null'));
  }

  var conf = new Conference({creator: user._id, attendees: [{user: user._id, status: 'creator'}], history: [{user: user._id, status: 'creation'}]});
  return conf.save(callback);
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

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  if (!status) {
    return callback(new Error('Undefined status'));
  }

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.update({_id: conference_id}, {$push: {history: {user: id, status: status}}}, {upsert: true}, callback);
}

/**
 * Invite a list of attendees inside a conference
 * @param {string} conference
 * @param {[string]} attendees - an array of user
 * @param {function} callback
 * @return {*}
 */
function invite(conference, attendees, callback) {
  if (!conference) {
    return callback(new Error('Can not invite to an undefined conference'));
  }

  if (!attendees) {
    return callback(new Error('Can not invite undefined attendees'));
  }

  if (!Array.isArray(attendees)) {
    attendees = [attendees];
  }

  attendees.forEach(function(element) {
    conference.attendees.push({
      user: element._id || element,
      status: 'invited'
    });
  });

  var localtopic = localpubsub.topic('conference:invite');

  conference.save(function(err, updated) {
    if (err) {
      return callback(err);
    }

    attendees.forEach(function(attendee) {
      var invitation = {
        conference_id: updated._id,
        user_id: attendee._id || attendee,
        creator_id: updated.creator
      };
      localtopic.forward(globalpubsub, invitation);
    });
    return callback(null, updated);
  });
}

/**
 * Get a conference by its id
 * @param {string} id
 * @param {function} callback
 */
function get(id, callback) {
  Conference.findById(id).exec(callback);
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

  var id = user._id || user;
  return callback(null, conference.creator.equals(id));
}

/**
 * Check is user is one of the conference attendees
 * @param {string} conference
 * @param {string} user
 * @param {function} callback
 * @return {*}
 */
function userIsConferenceAttendee(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.findOne({_id: conference_id}, {attendees: {$elemMatch: {user: id}}}).exec(function(err, conf) {
    if (err) {
      return callback(err);
    }
    return callback(null, (conf.attendees !== null && conf.attendees.length > 0));
  });
}

/**
 * Check if user can join conference
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

  userIsConferenceCreator(conference, user, function(err, status) {
    if (err) {
      return callback(err);
    }

    if (status) {
      return callback(null, true);
    }

    return userIsConferenceAttendee(conference, user, callback);
  });
}

  /**
 * Push user inside conference attendees
 * @param {string} conference
 * @param {string} user
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

  var conferenceId = conference._id || conference;
  var userId = user._id || user;

  Conference.findById(conferenceId, function(err, conf) {
    if (err) {
      return callback(err);
    }

    if (!conf) {
      return callback(new Error('No such conference'));
    }

    var found = false;
    conf.attendees.forEach(function(attendee) {
      if (attendee.user.toString() === userId + '') {
        found = true;
        attendee.status = 'online';
      }
    });

    if (!found) {
      conf.attendees.push({user: new mongoose.Types.ObjectId(userId + ''), status: 'online'});
    }

    conf.save(function(err, updated) {
      if (err) {
        return callback(err);
      }

      localpubsub.topic('conference:join')
        .forward(globalpubsub, {conference_id: conf._id, user_id: userId});

      addHistory(conf._id, userId, 'join', function(err, history) {
        if (err) {
          logger.warn('Error while pushing new history element ' + err.message);
        }
        return callback(null, conf);
      });
    });
  });
}

  /**
 * Remove user from conference attendees
 * @param {string} conference
 * @param {string} user
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

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.update({_id: conference_id, attendees: {$elemMatch: {user: id}}}, {$set: {'attendees.$': {user: id, status: 'offline'}}}, {upsert: true}, function(err, updated) {
    if (err) {
      return callback(err);
    }

    localpubsub.topic('conference:leave')
               .forward(globalpubsub, { conference_id: conference_id, user_id: id });

    addHistory(conference_id, id, 'leave', function(err, history) {
      if (err) {
        logger.warn('Error while pushing new history element ' + err.message);
      }
      return callback(null, updated);
    });
  });
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
 * @type {get}
 */
module.exports.get = get;
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
 * @type {userIsConferenceAttendee}
 */
module.exports.userIsConferenceAttendee = userIsConferenceAttendee;
/**
 * @type {userCanJoinConference}
 */
module.exports.userCanJoinConference = userCanJoinConference;
/**
 * @type {join}
 */
module.exports.join = join;
/**
 * @type {leave}
 */
module.exports.leave = leave;
