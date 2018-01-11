const async = require('async');
const moduleManager = require('./backend/module-manager');
const core = require('./backend/core');
const logger = core.logger;
const { modules } = core.config('default');

function setupServerEnvironment(callback) {
  moduleManager.setupServerEnvironment().then(() => callback(), callback);
}

function fireAppState(state) {
  return function fireApp(callback) {
    moduleManager.manager.fire(state, modules).then(() => callback(), callback);
  };
}

function initCore(callback) {
  core.init(err => {
    if (!err) {
      /*eslint no-process-env: 0*/
      logger.info(`Hublin core bootstraped, configured in ${process.env.NODE_ENV} mode`);
    }
    callback(err);
  });
}

async.series([setupServerEnvironment, fireAppState('lib'), initCore, fireAppState('start')], err => {
  if (err) {
    logger.error('Fatal error:', err);
    if (err.stack) {
      logger.error(err.stack);
    }
    /*eslint no-process-exit: 0*/
    process.exit(1);
  }
  logger.info(`Hublin is now started on node ${process.version}`);
});
