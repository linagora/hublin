'use strict';

var fs = require('fs-extra');
var request = require('supertest');

describe('The google-analytics module', function() {
  let moduleManager, application, config;

  beforeEach(function(done) {
    const self = this;

    fs.copySync(this.testEnv.fixtures + '/google-analytics-default.json', this.testEnv.tmp + '/default.test.json');

    this.mongoose = require('mongoose');
    this.testEnv.initRedisConfiguration(this.mongoose, function(err) {
      if (err) {
        return done(err);
      }

      var core = self.testEnv.initCore(function() {
        config = core.config('default');
        done();
      });
    });
  });

  beforeEach(function(done) {
    moduleManager = require(this.testEnv.basePath + '/backend/module-manager');
    moduleManager.setupServerEnvironment()
    .then(function() {
      return moduleManager.manager.load(['linagora.io.meetings.webserver', 'linagora.io.meetings.wsserver', 'linagora.esn.webrtc']);
    }).then(function() {
      return moduleManager.manager.fire('deploy', config.modules);
    }).then(function() {
      application = moduleManager.manager.moduleStore.get('linagora.io.meetings.webserver').getLib().application;
      done();
    }, done);
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
