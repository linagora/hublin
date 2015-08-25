'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var AwesomeAnalyticsGoogleModule = new AwesomeModule('linagora.esn.analytics-google', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'webserver.wrapper', 'webserver-wrapper')
  ],
  states: {
    lib: function(dependencies, callback) {
      return callback();
    },
    deploy: function(dependencies, callback) {
      // register the webapp
      var webserver = dependencies('webserver-wrapper');

      var depList = ['google.js'];
      depList = depList.map(function(d) { return '../../analytics/' + d; });

      webserver.injectJS('analytics-google', depList, ['live-conference', 'meetings']);

      return callback(null, {});
    },
    start: function(dependencies, callback) {
      callback();
    }
  }
});

module.exports = AwesomeAnalyticsGoogleModule;
