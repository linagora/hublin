'use strict';

var AwesomeModuleManagerProxy = require('awesome-module-manager/lib/manager-proxy');

function noop() {}

function consoleLogger() {
  console.log.apply(console, arguments);
}

function TestLogger() {
}

/**
 *
 * @type {noop}
 */
TestLogger.prototype.info = noop;

/**
 *
 * @type {consoleLogger}
 */
TestLogger.prototype.warn = consoleLogger;

/**
 *
 * @type {consoleLogger}
 */
TestLogger.prototype.error = consoleLogger;

/**
 *
 * @type {consoleLogger}
 */
TestLogger.prototype.success = consoleLogger;

/**
 *
 * @type {noop}
 */
TestLogger.prototype.debug = noop;

/**
 *
 * @param {object} mixin
 * @param {object} testEnv
 */
module.exports = function(mixin, testEnv) {
  var modules = {};
  mixin.modules = modules;

  modules.initMidway = function(moduleName, done) {
    var moduleManager = require('../../backend/module-manager');
    var logger = new TestLogger();
    moduleManager.manager.logger = logger;
    moduleManager.manager.stateManager.logger = logger;
    moduleManager.manager.moduleStore.logger = logger;
    moduleManager.manager.loader.logger = logger;
    moduleManager.setupServerEnvironment();
    moduleManager.manager.fire('lib', moduleName)
    .then(
      function() {
        modules.current = {
          lib: modules.getLib(moduleName),
          deps: modules.getDeps(moduleName)
        };
        testEnv.initCore(done);
      },
      done
    );
  };

  modules.getDeps = function(moduleName) {
    var moduleManager = require('../../backend/module-manager');
    var moduleStore = moduleManager.manager.moduleStore;
    var module = moduleStore.get(moduleName);
    if (!module) {
      throw new Error('Module ' + moduleName + ' not found in the module manager. Maybe it is not loaded yet ?');
    }
    return new AwesomeModuleManagerProxy(module, moduleStore).getProxy();
  };

  modules.getLib = function(moduleName) {
    var moduleManager = require('../../backend/module-manager');
    var moduleStore = moduleManager.manager.moduleStore;
    var module = moduleStore.get(moduleName);
    if (!module) {
      throw new Error('Module ' + moduleName + ' not found in the module manager. Maybe it is not loaded yet ?');
    }
    return module.getLib();
  };

  modules.getWebServer = function(app) {
    var application = require('../../backend/webserver/application');
    application.use(app);
    return application;
  };
};
