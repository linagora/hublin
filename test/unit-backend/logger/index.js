'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var rewire = require('rewire');

describe('The logger module', function() {

  describe('The load fn', function() {

    it('should return an unconfigured logger when configuration is undefined', function(done) {
      var module = rewire('../../../backend/logger');
      module.__set__('getNewLogger', function() {
        return done;
      });
      var logger = module.load();
      logger();
    });

    it('should return an unconfigured logger when configuration is empty', function(done) {
      var module = rewire('../../../backend/logger');
      module.__set__('getNewLogger', function() {
        return done;
      });
      var logger = module.load([]);
      logger();
    });

    it('should add all the configured loggers', function() {
      var config = [
        {name: 'Console', enabled: true, options: {'A': 1}},
        {name: 'Fake', enabled: true, options: {'B': 2}}
      ];

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

      mockery.registerMock('winston', winston);
      var module = this.helpers.requireBackend('logger');
      module.load(config);
      expect(call).to.equal(2);
    });

    it('should not add disabled loggers', function() {
      var config = [{name: 'Console', options: {'A': 1}}, {name: 'Fake', enabled: true, options: {'B': 2}}];

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
      var module = this.helpers.requireBackend('logger');
      module.load(config);
      expect(call).to.equal(1);
    });

    it('should load the external modules', function(done) {
      var external = {
        External: function() {
          done();
        }
      };

      var config = [{name: 'External', module: 'external-transport', enabled: true, options: {'B': 2}}];

      var winston = {
        Logger: function() {
          return {
            add: function(logger, options) {
              expect(logger).to.be.a.function;
              expect(options).to.exist;
              logger();
            }
          };
        }
      };

      mockery.registerMock('winston', winston);
      mockery.registerMock('external-transport', external);
      var module = this.helpers.requireBackend('logger');
      module.load(config);
    });

    it('should not fail when loading external module fail', function() {
      var external = {
        External: function() {
        }
      };

      var config = [
        {name: 'ExternalFail', module: 'external-fail-transport', enabled: true, options: {'fail': true}},
        {name: 'External', module: 'external-transport', enabled: true, options: {'fail': false}}
      ];

      var call = 0;

      var winston = {
        Logger: function() {
          return {
            add: function(logger, options) {
              expect(logger).to.be.a.function;
              expect(options).to.exist;
              expect(options.fail).to.be.false;
              call++;
            }
          };
        }
      };

      mockery.registerMock('../config', config);
      mockery.registerMock('winston', winston);
      mockery.registerMock('external-transport', external);
      var module = this.helpers.requireBackend('logger');
      module.load(config);
      expect(call).to.equal(1);
    });
  });
});
