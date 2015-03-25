'use strict';

var Winston = require('winston');

var DEFAULT_CONSOLE_OPTIONS = {
  enabled: true,
  level: 'info',
  handleExceptions: true,
  json: false,
  prettyPrint: true,
  colorize: false
};

var getNewLogger = function() {
  return new (Winston.Logger)({
    exitOnError: false
  });
};
module.exports.getNewLogger = getNewLogger;

var getDefaultLogger = function() {
  return getNewLogger().add(Winston.transports.Console, DEFAULT_CONSOLE_OPTIONS);
};
module.exports.getDefaultLogger = getDefaultLogger;

module.exports.load = function(config) {

  var winstonLogger = getNewLogger();

  if (!config || config.length === 0) {
    return winstonLogger;
  }

  var loadExternalTransport = function(logger) {
    try {
      var module = require(logger.module);
      winstonLogger.add(module[logger.name], logger.options);
    } catch (error) {
      console.log('Can not load logger %s', logger.name, error);
    }
  };

  var loadWinstonTransport = function(logger) {
    try {
      winstonLogger.add(Winston.transports[logger.name], logger.options);
    } catch (error) {
      console.log('Can not load logger %s', logger.name, error);
    }
  };

  config.forEach(function(logger) {
    if (logger.enabled) {

      if (logger.module) {
        loadExternalTransport(logger);
      } else {
        loadWinstonTransport(logger);
      }

    } else {
      console.log('Logger %s is disabled', logger.name);
    }
  });

  return winstonLogger;
};
