'use strict';

var Pubsub = require('../pubsub');
var redisPubsub = new Pubsub();
var localPubsub = require('../').local;
var AwesomeNodeRedisPubsub = require('awesome-node-redis-pubsub');
var logger = require('../../logger');

/**
 * @type {Pubsub}
 */
module.exports = redisPubsub;

localPubsub.topic('redis:configurationAvailable').subscribe(function(config) {
  config.onRedisError = function(err) {
    logger.error('Got an error on redis pubsub', err);
    logger.debug('Redis pubsub error stack: %s', err.stack);
  };
  var client = new AwesomeNodeRedisPubsub(config);
  redisPubsub.setClient(client);
});
