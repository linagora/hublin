'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');

describe('The core logger module', function() {

  describe('When no configured loggers', function() {
    it('should get the default logger if undefined loggers configuration', function(done) {
      mockery.registerMock('../config', function() {return {loggers: undefined};});
      mockery.registerMock('../../logger', {
        getDefaultLogger: function() {
          done();
        }
      });
      this.helpers.requireBackend('core/logger');
    });

    it('should get the default logger if empty loggers configuration', function(done) {
      mockery.registerMock('../config', function() {return {loggers: []};});
      mockery.registerMock('../../logger', {
        getDefaultLogger: function() {
          done();
        }
      });
      this.helpers.requireBackend('core/logger');
    });
  });

  describe('When configured loggers', function() {
    it('should load the logger from configuration', function(done) {
      var loggers = [1, 2, 3];
      mockery.registerMock('../config', function() {return {loggers: loggers};});
      mockery.registerMock('../../logger', {
        load: function(configuration) {
          expect(configuration).to.deep.equals(loggers);
          done();
        }
      });
      this.helpers.requireBackend('core/logger');
    });
  });
});
