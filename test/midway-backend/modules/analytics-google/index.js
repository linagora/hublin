'use strict';

var fs = require('fs-extra');
var request = require('supertest');

describe('The google-analytics module', function() {
  var moduleManager, application;
  beforeEach(function(done) {
    var config;
    fs.copySync(this.testEnv.fixtures + '/google-analytics-default.json', this.testEnv.tmp + '/default.test.json');
    var core = this.testEnv.initCore(function() {
      config = core.config('default');
    });


    moduleManager = require(this.testEnv.basePath + '/backend/module-manager');
    moduleManager.setupServerEnvironment()
    .then(function() {
      return moduleManager.manager.load(['linagora.io.meetings.webserver', 'linagora.io.meetings.wsserver', 'linagora.io.webrtc']);
    }).then(function() {
      return moduleManager.manager.fire('deploy', config.modules);
    }).then(function() {
      application = moduleManager.manager.moduleStore.get('linagora.io.meetings.webserver').getLib().application;
      done();
    }, function(err) {
      done(err);
    });
  });

  it('should serve the google.js file inserting the GA_UA', function(done) {
    request(application)
      .get('/analytics/google.js')
      .expect(/GA_UA : 'this-for-the-tests'/)
      .end(done);
  });


  afterEach(function() {
    fs.unlinkSync(this.testEnv.tmp + '/default.test.json');
  });

});
