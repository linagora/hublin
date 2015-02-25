'use strict';

var i18n = require('../../i18n');

var initialized = false;

var NAMESPACE = '/conferences';
var NOTIFICATION_EVENT = 'notification';
var JOINER_TOPIC = 'conference:join';
var LEAVER_TOPIC = 'conference:leave';

/**
 * @param {Function} dependencies
 * @return {{init: init}}
 */
module.exports = function(dependencies) {

  var wsserver = dependencies('wsserver');
  var logger = dependencies('logger');
  var pubsub = dependencies('pubsub');
  var global = pubsub.global;

  var helper = wsserver.helper;

  function notifyRoom(io, uuid, msg) {
    io.of(NAMESPACE)
      .to(uuid)
      .emit(NOTIFICATION_EVENT, {room: uuid, data: msg});
  }

  function init(io) {
    if (initialized) {
      logger.warn('The notification conferences service is already initialized');
      return;
    }

    logger.info('Initializing conference events listener');

    global.topic(JOINER_TOPIC).subscribe(function(msg) {
      logger.debug('Got a %s event', JOINER_TOPIC, msg);
      if (!msg.user) {
        return logger.debug('Can not find user from notification', msg);
      }

      if (!msg.conference) {
        return logger.debug('Can not find user from notification', msg);
      }

      msg.message = i18n.__('%s has joined the conference', msg.user.displayName);
      notifyRoom(io, msg.conference._id, msg);
    });

    global.topic(LEAVER_TOPIC).subscribe(function(msg) {
      logger.debug('Got a %s event', LEAVER_TOPIC, msg);
      if (!msg.user) {
        return logger.debug('Can not find user from notification', msg);
      }

      if (!msg.conference) {
        return logger.debug('Can not find user from notification', msg);
      }

      msg.message = i18n.__('%s has left the conference', msg.user.displayName);
      notifyRoom(io, msg.conference._id, msg);
    });

    io.of(NAMESPACE)
      .on('connection', function(socket) {
        var userId = helper.getUserId(socket);
        logger.info('User', userId, ': new connection on /conferences');

        socket.on('subscribe', function(uuid) {
          logger.info('User', userId, ': joining room /', NAMESPACE, '/', uuid);
          socket.join(uuid);
        });

        socket.on('unsubscribe', function(uuid) {
          logger.info('User', userId, ': leaving room /', NAMESPACE, '/', uuid);
          socket.leave(uuid);
        });
      });

    initialized = true;
  }

  return {
    init: init
  };
};
