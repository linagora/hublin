'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var WsServer = new AwesomeModule('linagora.io.meetings.wsserver', {
  dependencies: [
    new Dependency(Dependency.TYPE_ABILITY, 'wsserver', 'wsserver'),
    new Dependency(Dependency.TYPE_ABILITY, 'logger', 'logger'),
    new Dependency(Dependency.TYPE_ABILITY, 'conference', 'conference'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.core.pubsub', 'pubsub')
  ],
  states: {
    lib: function(dependencies, callback) {
      var wsserver = dependencies('wsserver');
      var auth = require('./auth')(wsserver);
      var events = require('./events')(dependencies);
      return callback(null, {
        server: wsserver.server,
        auth: auth,
        events: events
      });
    },
    start: function(dependencies, callback) {
      this.server.io.use(this.auth);
      this.events.init(this.server.io);
      return callback();
    }
  }
});

/**
 * @type {AwesomeModule}
 */
module.exports.WsServer = WsServer;
