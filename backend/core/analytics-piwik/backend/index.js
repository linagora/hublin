'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var AwesomeAnalyticsPiwikModule = new AwesomeModule('linagora.esn.analytics-piwik', {
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

      var depList = ['piwik.js'];
      depList = depList.map(function(d) { return '../../analytics/' + d; });

      webserver.injectJS('analytics-piwik', depList, ['live-conference', 'meetings']);

      return callback(null, {});
    },
    start: function(dependencies, callback) {
      callback();
    }
  }
});

module.exports = AwesomeAnalyticsPiwikModule;
