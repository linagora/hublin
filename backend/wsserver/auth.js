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
    if (!query.token || !query.user) {
      return callback(new Error('Token or user not found'));
    }

    // TODO : Get user from backend if needed
    wsserver.helper.setUserId(socket, query.user);
    return callback();
  };

  return auth;
};

