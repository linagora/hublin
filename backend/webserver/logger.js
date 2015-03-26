'use strict';

var logger = require('../logger');
var config = require('../core').config('default');
var morgan = require('morgan');

var options = {};

var format = process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

if (config.webserver && config.webserver.loggers && config.webserver.loggers.length > 0) {
  var webserverLogger = logger.load(config.webserver.loggers);
  options.stream = {
    write: function(message) {
      webserverLogger.info(message.slice(0, -1));
    }
  };
}

module.exports = morgan(format, options);
