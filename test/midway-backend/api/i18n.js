'use strict';

var request = require('supertest'),
    apiHelpers = require('../../helpers/api-helpers.js');

describe('The i18n API', function() {

  var application,
      dependencies = function() {};

  beforeEach(function(done) {
    this.testEnv.initCore(function() {
      var router = apiHelpers.getRouter('i18n', dependencies);

      application = apiHelpers.getApplication(router, dependencies);
      done();
    });
  });

  describe('GET /api/i18n/', function() {

    it('should send 200 and give back the catalog as UTF-8 JSON when locale is not specified', function(done) {
      request(application)
        .get('/api/i18n/')
        .send()
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(this.helpers.callbacks.noError(done));
    });

    it('should send 200 and give back the catalog as UTF-8 JSON when locale is specified as a query parameter', function(done) {
      request(application)
        .get('/api/i18n/?locale=fr')
        .send()
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(this.helpers.callbacks.noError(done));
    });

    it('should send 404 when locale is unsupported', function(done) {
      request(application)
        .get('/api/i18n/?locale=zz')
        .send()
        .expect(404)
        .end(this.helpers.callbacks.noError(done));
    });

  });

});
