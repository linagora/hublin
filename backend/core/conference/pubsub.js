'use strict';

var pubsub = require('../pubsub').local;

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

  pubsub.topic('conference:invite').subscribe(processInvitation);
};
