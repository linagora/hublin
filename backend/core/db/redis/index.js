'use strict';

var logger = require('../../../core/logger');
var esnconfig = require('../../../core/esn-config');
var pubsub = require('../../../core/pubsub').local;

var initialized = false;
var connected = false;
var client;

var defaultOptions = {
  host: 'localhost',
  port: 6379
};

var getRedisConfiguration = function(options) {
  var redisConfig = options || defaultOptions;

  if (redisConfig.url) {
    var url = require('url').parse(redisConfig.url);
    if (url.protocol === 'redis:') {
      if (url.auth) {
        var userparts = url.auth.split(':');
        redisConfig.user = userparts[0];
        if (userparts.length === 2) {
          redisConfig.pass = userparts[1];
        }
      }
      redisConfig.host = url.hostname;
      redisConfig.port = url.port;
      if (url.pathname) {
        redisConfig.db = url.pathname.replace('/', '', 1);
      }
    }
  }

  pubsub.topic('redis:configurationAvailable').publish(redisConfig);
  return redisConfig;
};

var createClient = function(options, callback) {
  var redisConfig = getRedisConfiguration(options);

  var client = redisConfig.client || new require('redis').createClient(redisConfig.port || redisConfig.socket, redisConfig.host, redisConfig);
  if (redisConfig.pass) {
    client.auth(redisConfig.pass, function(err) {
      if (err) {
        callback(err);
      }
    });
  }

  if (redisConfig.db) {
    client.select(redisConfig.db);
    client.on('connect', function() {
      client.send_anyways = true;
      client.select(redisConfig.db);
      client.send_anyways = false;
    });
  }

  client.on('error', function(err) {
    logger.error('Redis connection error', err);
  });

  client.on('connect', function() {
    logger.info('Connected to Redis', redisConfig);
    connected = true;
  });

  client.on('ready', function() {
    logger.info('Redis is Ready');
  });

  return callback(null, client);
};
/**
 * @type {Function}
 */
module.exports.createClient = createClient;

var init = function(callback) {
  esnconfig('redis').get(function(err, config) {
    if (err) {
      logger.error('Error while getting the redis configuration', err);
      return callback(err);
    }
    createClient(config, function(err, client) {
      if (client) {
        initialized = true;
      }
      return callback(err, client);
    });
  });
};
/**
 * @type {Function}
 */
module.exports.init = init;

pubsub.topic('mongodb:connectionAvailable').subscribe(function() {
  init(function(err, c) {
    if (err) {
      logger.error('Error while creating redis client', err);
    }

    if (c) {
      client = c;
    }
  });
});

/**
 * @return {boolean}
 */
module.exports.isInitialized = function isInitialized() {
  return initialized;
};

/**
 * @return {boolean}
 */
module.exports.isConnected = function isConnected() {
  return connected;
};

/**
 * @return {*}
 */
module.exports._getClient = function _getClient() {
  return client;
};

/**
 * @param {function} callback
 * @return {*}
 * @this this
 */
module.exports.getClient = function(callback) {
  if (this.isConnected() && this._getClient()) {
    return callback(null, client);
  } else {
    return init(callback);
  }
};
