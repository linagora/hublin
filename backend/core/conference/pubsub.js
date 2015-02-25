'use strict';

var pubsub = require('../pubsub').local;

/**
 * Instantiates all pubsub listener related to conferences
 * @param {dependencies} dependencies
 */
module.exports.init = function(dependencies) {
  var invitation = dependencies('invitation');

  function processInvitation(data, callback) {
    invitation.sendInvitation(data.creator, data.user, data.conference, data.user.objectType, callback);
  }

  pubsub.topic('conference:invite').subscribe(processInvitation);
};
