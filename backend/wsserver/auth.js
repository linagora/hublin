'use strict';

/**
 * @param {WebSocketServer} wsserver
 * @return {Function}
 */
module.exports = function(wsserver) {

  var auth = function(socket, callback) {
    var infos = wsserver.helper.getInfos(socket);
    if (!infos || !infos.query) {
      return callback(new Error('Invalid socket object passed in argument'));
    }
    var query = infos.query;
    if (!query.user || query.user === 'undefined') {
      return callback(new Error('User is required'));
    }

    // TODO : Get user from backend if needed
    wsserver.helper.setUserId(socket, query.user);
    return callback();
  };

  return auth;
};

