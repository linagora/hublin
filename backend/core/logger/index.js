'use strict';

var config = require('../config')('default');
var Winston = require('winston');

var DEFAULT_CONSOLE_OPTIONS = {
  enabled: true,
  level: 'info',
  handleExceptions: true,
  json: false,
  prettyPrint: true,
  colorize: false
};

var winstonLogger = new (Winston.Logger)({
  exitOnError: false
});

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

if (!config.loggers || config.loggers.length === 0) {
  winstonLogger.add(Winston.transports.Console, DEFAULT_CONSOLE_OPTIONS);
} else {
  config.loggers.forEach(function(logger) {
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
}

/**
 * @return {Winston.logger} using {@link https://github.com/winstonjs/winston}
 */
module.exports = winstonLogger;
