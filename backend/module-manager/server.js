'use strict';

/**
 * Configure the AwesomeModuleManager by adding states and modules into the Meetings application.
 * @param {object} moduleManager
 */
module.exports = function setupServer(moduleManager) {
  moduleManager.manager.registerState('deploy', ['lib']);
  moduleManager.manager.registerState('start', ['lib', 'deploy']);

  moduleManager.setupManager();

  moduleManager.manager.registerModule(require('../').Meetings, true);
  moduleManager.manager.registerModule(require('../webserver').WebServer, true);
};
