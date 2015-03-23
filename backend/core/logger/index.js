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

if (!config.loggers || config.loggers.length === 0) {
  winstonLogger.add(Winston.transports.Console, DEFAULT_CONSOLE_OPTIONS);
} else {
  config.loggers.forEach(function(logger) {
    if (logger.enabled) {
      try {
        winstonLogger.add(Winston.transports[logger.name], logger.options);
      } catch (error) {
        console.log('Can not load logger %s', logger.name, error);
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
