'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var Meetings = new AwesomeModule('linagora.io.meetings', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.webserver', 'webserver'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.om.wsserver', 'wsserver'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.webrtc', 'webrtc')
  ],
  states: {
    lib: function(dependencies, callback) {
      var all = require('./webserver/routes/all')(dependencies);
      var meetings = require('./webserver/routes/meetings')(dependencies);
      var home = require('./webserver/routes/home')(dependencies);
      var conferences = require('./webserver/routes/conferences')(dependencies);

      return callback(null, {
        api: {
          meetings: meetings,
          all: all,
          conferences: conferences,
          home: home
        }
      });
    },

    deploy: function(dependencies, callback) {
      var webserver = dependencies('webserver');
      webserver.application.use('/', this.api.all);
      webserver.application.use('/', this.api.conferences);
      webserver.application.use('/', this.api.meetings);
      webserver.application.use('/', this.api.home);

      return callback();
    },

    start: function(dependencies, callback) {
      return callback();
    }
  }
});

/**
 * This is the main AwesomeModule of the Meetings application
 * @type {AwesomeModule}
 */
module.exports.Meetings = Meetings;
