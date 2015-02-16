'use strict';

var core = require('../core');
var AwesomeModuleManager = require('awesome-module-manager');
var setupServer = require('./server');

var manager = new AwesomeModuleManager(core.logger);

function setupManager() {
  core.moduleManager = manager;
  return manager;
}

function setupServerEnvironment() {
  setupServer(module.exports);
}

module.exports.manager = manager;
module.exports.setupManager = setupManager;
module.exports.setupServerEnvironment = setupServerEnvironment;
