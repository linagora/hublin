'use strict';

module.exports = function setupServer(moduleManager) {
  moduleManager.manager.registerState('deploy', ['lib']);
  moduleManager.manager.registerState('start', ['lib', 'deploy']);

  moduleManager.setupManager();

  moduleManager.manager.registerModule(require('../').Meetings, true);
  moduleManager.manager.registerModule(require('../webserver').WebServer, true);
};
