'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var Meetings = new AwesomeModule('linagora.io.meetings', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.webserver', 'webserver')
  ],
  states: {
    lib: function(dependencies, callback) {
      var meetings = require('./webserver/routes/meetings')(dependencies);
      return callback(null, {
        api: {
          meetings: meetings
        }
      });
    },

    deploy: function(dependencies, callback) {
      var webserver = dependencies('webserver');
      webserver.application.use('/', this.api.meetings);

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
