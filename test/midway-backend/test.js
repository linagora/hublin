'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    apiHelpers = require('../helpers/api-helpers.js');

describe('Midway test', function() {
  var application;

  before(function() {
    var router = apiHelpers.getRouter('meetings');
    application = apiHelpers.getApplication(router, function() {});
  });

  it('should work', function(done) {
    request(application)
      .get('/meetings')
      .expect(200)
      .end(function(err, res) {
        expect(res.text).to.equal('Hello Meetings !');
        done();
      });
  });

});
