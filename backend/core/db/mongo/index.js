'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = require('url');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var logger = require('../../../core').logger;
var config = require('../../../core').config;
var topic = require('../../../core').pubsub.local.topic('mongodb:connectionAvailable');
var configurationWatcher = require('./file-watcher');
var initialized = false;
var connected = false;

function onConnectError(err) {
  logger.error('Failed to connect to MongoDB:', err.message);
}

mongoose.connection.on('error', function(e) {
  onConnectError(e);
  initialized = false;
});

mongoose.connection.on('connected', function(e) {
  logger.debug('mongoose connected event');
  connected = true;
  topic.publish();
});

mongoose.connection.on('disconnected', function(e) {
  logger.debug('mongoose disconnected event');
  connected = false;
});

var getTimeout = function() {
  return process.env.MONGO_TIMEOUT || 10000;
};

function openDatabase(connectionString, callback) {
  MongoClient.connect(connectionString, function(err, db) {
    if (err && db && ('close' in db)) {
      db.close();
    }
    callback(err, db);
  });
}

function insertDocument(db, collectionName, document, callback) {
  var collection = db.collection(collectionName);
  collection.insert(document, function(err, coll) {
    if (err) {
      db.close(function(err, data) {
        //ignore error
      });
    }
    return callback(err, coll);
  });
}

function dropCollection(db, collectionName, callback) {
  db.dropCollection(collectionName, function(err, data) {
    db.close(function(err, data) {
        //ignore error
    });
    return callback(err);
  });
}

function getConnectionString(hostname, port, dbname, username, password, connectionOptions) {
  var timeout = getTimeout();
  connectionOptions = connectionOptions || {
    connectTimeoutMS: timeout,
    socketTimeoutMS: timeout
  };

  var connectionHash = {
    hostname: hostname,
    port: port,
    pathname: '/' + dbname,
    query: connectionOptions
  };
  if (username) {
    connectionHash.auth = username + ':' + password;
  }

  return 'mongodb:' + url.format(connectionHash);
}

function getDbConfigurationFile() {
  var root = path.resolve(__dirname + '/../../../..');
  var defaultConfig = config('default');
  var dbConfigurationFile;
  if (defaultConfig.core && defaultConfig.core.config && defaultConfig.core.config.db) {
    dbConfigurationFile = path.resolve(root + '/' + defaultConfig.core.config.db);
  } else {
    dbConfigurationFile = root + '/config/db.json';
  }
  return dbConfigurationFile;
}

function storeConfiguration(configuration, callback) {
  var dbConfigurationFile = getDbConfigurationFile();
  var finalConfiguration = {};
  finalConfiguration.connectionOptions = configuration.connectionOptions;
  finalConfiguration.connectionString = getConnectionString(configuration.hostname,
                                                            configuration.port,
                                                            configuration.dbname,
                                                            configuration.username,
                                                            configuration.password,
                                                            {});

  fs.writeFile(dbConfigurationFile, JSON.stringify(finalConfiguration), function(err) {
    if (err) {
      logger.error('Cannot write database configuration file %s', dbConfigurationFile, err);
      var error = new Error('Can not write database settings in ' + dbConfigurationFile);
      return callback(error);
    }
    return callback(null, finalConfiguration);
  });
}

/**
 * @type {storeConfiguration}
 */
module.exports.storeConfiguration = storeConfiguration;

/**
 * Checks that we can connect to mongodb
 *
 * @param {string} hostname
 * @param {string} port
 * @param {string} dbname
 * @param {string} username
 * @param {string} password
 * @param {function} callback
 */
function validateConnection(hostname, port, dbname, username, password, callback) {

  var connectionString = getConnectionString(hostname, port, dbname, username, password);

  var collectionName = 'connectionTest';
  var document = {test: true};

  openDatabase(connectionString, function(err, db) {
    if (err) {
      return callback(err);
    }
    insertDocument(db, collectionName, document, function(err) {
      if (err) {
        return callback(err);
      }
      dropCollection(db, collectionName, callback);
    });
  });
}

/**
 * @type {validateConnection}
 */
module.exports.validateConnection = validateConnection;
/**
 * @type {getConnectionString}
 */
module.exports.getConnectionString = getConnectionString;

function getDefaultOptions() {
  var timeout = getTimeout();
  return {
    db: {
      w: 1,
      fsync: true,
      native_parser: true
    },
    server: {
      socketOptions: {
        keepAlive: timeout,
        connectTimeoutMS: timeout
      },
      auto_reconnect: true,
      poolSize: 10
    }
  };
}
/**
 * @type {getDefaultOptions}
 */
module.exports.getDefaultOptions = getDefaultOptions;

function getConnectionStringAndOptions() {
  var dbConfig;
  try {
    dbConfig = config('db');
  } catch (e) {
    return false;
  }
  if (!dbConfig || !dbConfig.connectionString) {
    return false;
  }
  var options = dbConfig.connectionOptions ? dbConfig.connectionOptions : getDefaultOptions();
  return {url: dbConfig.connectionString, options: options};
}

var dbConfigWatcher = null;

function mongooseConnect(reinit) {
  var defaultConfig = config('default');
  if (defaultConfig.db && defaultConfig.db.reconnectOnConfigurationChange) {
    if (!dbConfigWatcher) {
      dbConfigWatcher = configurationWatcher(logger, getDbConfigurationFile(), reinit);
    }
    dbConfigWatcher();
  }

  var connectionInfos = getConnectionStringAndOptions();
  if (!connectionInfos) {
    return false;
  }

  try {
    logger.debug('launch mongoose.connect on %s', connectionInfos.url);
    mongoose.connect(connectionInfos.url, connectionInfos.options);
  } catch (e) {
    onConnectError(e);
    return false;
  }
  initialized = true;
  return true;
}

function init() {
  function reinit() {
    logger.info('Database configuration updated, reloading mongoose');
    config.clear();
    init();
  }

  if (initialized) {
    mongoose.disconnect(function() {
      initialized = false;
      mongooseConnect(reinit);
    });
    return;
  }
  return mongooseConnect(reinit);
}


/**
 * @type {init}
 */
module.exports.init = init;

/**
 * @return {boolean}
 */
module.exports.isInitalized = function() {
  return initialized;
};

/**
 * @return {boolean}
 */
module.exports.isConnected = function() {
  return connected;
};

/**
 * Load models
 */
module.exports.models = {};
fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  var stat = fs.statSync(__dirname + '/models/' + filename);
  if (!stat.isFile()) { return; }
  require('./models/' + filename);
});
