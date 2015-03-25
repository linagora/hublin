'use strict';

var config = require('../config')('default');
var logger = require('../../logger');

var winstonLogger;
if (!config.loggers || config.loggers.length === 0) {
  winstonLogger = logger.getDefaultLogger();
} else {
  winstonLogger = logger.load(config.loggers);
}

/**
 * @return {Winston.logger} using {@link https://github.com/winstonjs/winston}
 */
module.exports = winstonLogger;
