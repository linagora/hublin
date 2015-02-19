'use strict';

function registerModuleWrapper(moduleManager, module) {
  return function() {
    return moduleManager.manager.registerModule(module, true);
  };
}

/**
 * Configure the AwesomeModuleManager by adding states and modules into the Meetings application.
 * @param {object} moduleManager
 * @return {object} promise
 */
module.exports = function setupServer(moduleManager) {
  moduleManager.manager.registerState('deploy', ['lib']);
  moduleManager.manager.registerState('start', ['lib', 'deploy']);

  moduleManager.setupManager();
  return registerModuleWrapper(moduleManager, require('../webserver').WebServer)()
  .then(registerModuleWrapper(moduleManager, require('om-websocket-server')))
  .then(registerModuleWrapper(moduleManager, require('../').Meetings));
};
