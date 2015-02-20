'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var WsServer = new AwesomeModule('linagora.io.meetings.wsserver', {
  dependencies: [
    new Dependency(Dependency.TYPE_ABILITY, 'wsserver', 'wsserver')
  ],
  states: {
    lib: function(dependencies, callback) {
      var wsserver = dependencies('wsserver');
      var auth = require('./auth')(wsserver);
      return callback(null, {
        server: wsserver.server,
        auth: auth
      });
    },
    start: function(dependencies, callback) {
      this.server.io.use(this.auth);
      return callback();
    }
  }
});

/**
 * @type {AwesomeModule}
 */
module.exports.WsServer = WsServer;
