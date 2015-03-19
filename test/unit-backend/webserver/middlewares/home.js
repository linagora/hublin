'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var logger = require('../../../fixtures/logger-noop');

var MAX_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MIN_CONFERENCE_NAME_LENGTH;

describe('The home middleware', function() {

  var dependencies;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };
  });

  describe('The checkIdLength function', function() {

    function checkRenderCalled(done) {
      return {
        render: function(path) {
          expect(path).to.equal('commons/error');
          done();
        }
      };
    }

    function checkRenderNotCalled(done) {
      return {
        render: function() {
          done(new Error());
        }
      };
    }

    it('load call res.render if id is too short', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/home')(dependencies);
      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH - 1)
        }
      };
      middleware.checkIdLength(req, checkRenderCalled(done), function() {
        done(new Error());
      });
    });

    it('load call res.render if id is too long', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/home')(dependencies);
      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH + 1)
        }
      };
      middleware.checkIdLength(req, checkRenderCalled(done), function() {
        done(new Error());
      });
    });

    it('load call next if id is right length', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/home')(dependencies);
      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH - 1)
        }
      };
      middleware.checkIdLength(req, checkRenderNotCalled(done), done);
    });

    it('load call next if id is minimal length', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/home')(dependencies);
      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH)
        }
      };
      middleware.checkIdLength(req, checkRenderNotCalled(done), done);
    });

    it('load call next if id is maximal length', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/home')(dependencies);
      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH)
        }
      };
      middleware.checkIdLength(req, checkRenderNotCalled(done), done);
    });
  });
});
