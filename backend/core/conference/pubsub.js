'use strict';

var pubsub = require('../pubsub').local,
    conference = require('./index.js'),
    EVENTS = conference.EVENTS;

/**
 * Instantiates all pubsub listener related to conferences
 * @param {dependencies} dependencies
 */
module.exports.init = function(dependencies) {
  var invitation = dependencies('invitation');
  var logger = dependencies('logger');

  function processInvitation(data) {
    invitation.sendInvitation(data.creator, data.user, data.conference, data.user.objectType,
      function(err, response) {
        if (err) {
          return logger.error('Could not send invitation for %s in conference %s', data.user.id, data.conference.id, err);
        }
        return logger.debug('Invitation succesfully sent for %s in conference %s', data.user.id, data.conference.id, response);
      });
  }

  function processHistoryEvent(event) {
    return function(data) {
      conference.addHistory(data.conference, data.user, event, function(err, conference) {
        if (err) {
          return logger.error('Error while pushing event %s in history of conference %s', event, data.conference.toObject(), err);
        }

        return logger.debug('Added event %s in history of conference %s', event, data.conference.toObject());
      });
    };
  }

  pubsub.topic(EVENTS.invite).subscribe(processInvitation);

  Object.keys(EVENTS).forEach(function(key) {
    pubsub.topic(EVENTS[key]).subscribe(processHistoryEvent(EVENTS[key]));
  });
};
