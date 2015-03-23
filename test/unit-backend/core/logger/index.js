'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');

describe('The core logger module', function() {

  describe('When no configured loggers', function() {
    var getWinstonMock = function(done) {
      return {
        Logger: function() {
          return {
            add: function(logger, options) {
              expect(logger).to.be.a.function;
              expect(options).to.exist;
              logger();
            }
          };
        },
        transports: {
          Console: function() {
            done();
          }
        }
      };
    };

    it('should call winston#add with the Console transport if undefined loggers', function(done) {
      var config = function(name) {
        expect(name).to.equal('default');
        return {};
      };

      var winston = getWinstonMock(done);
      mockery.registerMock('../config', config);
      mockery.registerMock('winston', winston);
      expect(this.helpers.requireBackend('core/logger'));
    });

    it('should call winston#add with the Console transport if empty loggers', function(done) {
      var config = function(name) {
        expect(name).to.equal('default');
        return {
          loggers: []
        };
      };

      var winston = getWinstonMock(done);
      mockery.registerMock('../config', config);
      mockery.registerMock('winston', winston);
      expect(this.helpers.requireBackend('core/logger'));
    });
  });

  describe('When configured loggers', function() {

    it('should add all the configured loggers', function() {
      var config = function() {
        return {
          loggers: [{name: 'Console', enabled: true, options: {'A': 1}}, {name: 'Fake', enabled: true, options: {'B': 2}}]
        };
      };

      var call = 0;
      var winston = {
        Logger: function() {
          return {
            add: function(logger, options) {
              expect(logger).to.be.a.function;
              expect(options).to.exist;
              call++;
            }
          };
        },
        transports: {
          Console: function() {
          },
          Fake: function() {
          }
        }
      };

      mockery.registerMock('../config', config);
      mockery.registerMock('winston', winston);
      expect(this.helpers.requireBackend('core/logger'));
      expect(call).to.equal(2);
    });

    it('should not add disabled loggers', function() {
      var config = function() {
        return {
          loggers: [{name: 'Console', options: {'A': 1}}, {name: 'Fake', enabled: true, options: {'B': 2}}]
        };
      };

      var call = 0;
      var winston = {
        Logger: function() {
          return {
            add: function(logger, options) {
              expect(logger).to.be.a.function;
              expect(options).to.exist;
              call++;
            }
          };
        },
        transports: {
          Console: function() {
          }
        }
      };

      mockery.registerMock('../config', config);
      mockery.registerMock('winston', winston);
      expect(this.helpers.requireBackend('core/logger'));
      expect(call).to.equal(1);
    });

  });
});
