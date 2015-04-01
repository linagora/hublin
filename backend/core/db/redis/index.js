'use strict';

var logger = require('../../../core/logger'),
    esnconfig = require('../../../core/esn-config'),
    pubsub = require('../../../core/pubsub').local,
    redis = require('redis');

var initialized = false,
    connected = false,
    client;

var defaultOptions = {
  host: process.env.HUBLIN_REDIS_HOST || 'localhost',
  port: process.env.HUBLIN_REDIS_PORT || 6379,
  client_options: {}
};

function publishRedisConfiguration(config) {
  pubsub.topic('redis:configurationAvailable').publish(config);
}

function createClient(options, callback) {
  var config = options || defaultOptions;

  if (!config.client_options) {
    config.client_options = {};
  }

  publishRedisConfiguration(config);

  var client = redis.createClient(config.port, config.host, config.client_options);

  if (config.db) {
    client.select(config.db);
    client.on('connect', function() {
      client.send_anyways = true;
      client.select(config.db);
      client.send_anyways = false;
    });
  }

  client.on('error', function(err) {
    logger.error('Redis connection error', err);
  });

  client.on('connect', function() {
    logger.info('Connected to Redis', config);
    connected = true;
  });

  client.on('ready', function() {
    logger.info('Redis is Ready');
  });

  return callback(null, client);
}

function init(callback) {
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
}

function isInitialized() {
  return initialized;
}

function isConnected() {
  return connected;
}

function _getClient() {
  return client;
}

function getClient(callback) {
  if (isConnected() && _getClient()) {
    return callback(null, client);
  } else {
    return init(callback);
  }
}

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

module.exports = exports = {
  init: init,
  createClient: createClient,
  isConnected: isConnected,
  isInitialized: isInitialized,
  getClient: getClient,
  _getClient: _getClient
};
