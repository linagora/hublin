'use strict';

var async = require('async');
var moduleManager = require('./backend/module-manager');
var core = require('./backend/core');
var logger = core.logger;
var config = core.config('default');

var modules = config.modules;

moduleManager.setupServerEnvironment();

function fireESNState(state) {
  return function fireESN(callback) {
    moduleManager.manager.fire(state, modules).then(function() {
      callback(null);
    }, function(err) {
      callback(err);
    });
  };
}

async.series([fireESNState('lib'), fireESNState('start')], function(err) {
  if (err) {
    logger.error('Fatal error:', err);
    if (err.stack) {
      logger.error(err.stack);
    }
    process.exit(1);
  }
  logger.info('Meetings is now started on node %s', process.version);
});
