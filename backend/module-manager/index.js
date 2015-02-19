'use strict';

var Path = require('path');
var fs = require('fs');
var core = require('../core');
var AwesomeModuleManager = require('awesome-module-manager');
var AwesomeModule = require('awesome-module');
var MEETINGS_MODULE_PREFIX = 'linagora.io.meetings.core.';
var setupServer = require('./server');

var manager = new AwesomeModuleManager(core.logger);

function mockCoreModule(name) {
  var mock = new AwesomeModule(MEETINGS_MODULE_PREFIX + name, {
    states: {
      lib: function(deps, callback) {
        return callback(null, core[name]);
      }
    },
    abilities: [name]
  });
  var loader = manager.loaders.code(mock, true);
  manager.appendLoader(loader);
}

function mockCore() {
  var corePath = Path.join(__dirname, '..', 'core');
  fs.readdirSync(corePath).forEach(function(filename) {
    var modPath = Path.join(corePath, filename);
    var stat = fs.statSync(modPath);
    if (!stat.isDirectory()) { return; }
    mockCoreModule(filename);
  });
}

function setupManager() {
  mockCore();
  core.moduleManager = manager;
  return manager;
}

function setupServerEnvironment() {
  return setupServer(module.exports);
}

/**
 * See {@link setupManager}
 */
module.exports.setupManager = setupManager;
/**
 * @return {AwesomeModuleManager}
 */
module.exports.manager = manager;
/**
 * See {@link setupServerEnvironment}
 */
module.exports.setupServerEnvironment = setupServerEnvironment;
