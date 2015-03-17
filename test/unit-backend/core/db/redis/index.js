'use strict';

var mockery = require('mockery'),
    rewire = require('rewire'),
    chai = require('chai'),
    expect = chai.expect;

describe('The db/redis module', function() {

  function newDummyRedisClient() {
    return {
      on: function() {},
      select: function() {}
    };
  }

  describe('The init function', function() {

    it('should read configuration from esn-config', function(done) {
      mockery.registerMock('../../../core/esn-config', function() {
        return {
          get: function() {
            done();
          }
        };
      });

      this.helpers
        .requireBackend('core/db/redis')
        .init();
    });

    it('should send back an error if it cannot read configuration from esn-config', function(done) {
      mockery.registerMock('../../../core/esn-config', function() {
        return {
          get: function(callback) {
            callback(new Error('WTF'));
          }
        };
      });

      this.helpers
        .requireBackend('core/db/redis')
        .init(this.helpers.callbacks.error(done));
    });

    it('should send back an error if createClient fails', function(done) {
      mockery.registerMock('../../../core/esn-config', function() {
        return {
          get: function(callback) {
            callback(null, {});
          }
        };
      });

      var module = rewire('../../../../../backend/core/db/redis');

      module.__set__('createClient', function(config, callback) {
        callback(new Error('WTF'));
      });
      module.init(this.helpers.callbacks.error(done));
    });

    it('should set initialized=false if createClient fails to create a client', function(done) {
      mockery.registerMock('../../../core/esn-config', function() {
        return {
          get: function(callback) {
            callback(null, {});
          }
        };
      });

      var module = rewire('../../../../../backend/core/db/redis');

      module.__set__('createClient', function(config, callback) {
        callback();
      });
      module.init(function(err, client) {
        expect(err).to.not.exist;
        expect(client).to.not.exist;
        expect(module.isInitialized()).to.be.false;

        done();
      });
    });

    it('should set initialized=true if createClient successfully creates a client', function(done) {
      mockery.registerMock('../../../core/esn-config', function() {
        return {
          get: function(callback) {
            callback(null, {});
          }
        };
      });

      var module = rewire('../../../../../backend/core/db/redis');

      module.__set__('createClient', function(config, callback) {
        callback(null, {});
      });
      module.init(function(err, client) {
        expect(err).to.not.exist;
        expect(client).to.exist;
        expect(module.isInitialized()).to.be.true;

        done();
      });
    });

  });

  describe('The createClient function', function() {

    it('should use default configuration if nothing is defined in esn-config', function(done) {
      mockery.registerMock('redis', {
        createClient: function(port, host, client_options) {
          expect(port).to.equal(6379);
          expect(host).to.equal('localhost');
          expect(client_options).to.deep.equals({});

          return newDummyRedisClient();
        }
      });

      this.helpers.mock.pubsub('../../../core/pubsub', {});
      this.helpers
        .requireBackend('core/db/redis')
        .createClient(null, this.helpers.callbacks.noError(done));
    });

    it('should use the given configuration when defined', function(done) {
      mockery.registerMock('redis', {
        createClient: function(port, host, client_options) {
          expect(port).to.equal(65535);
          expect(host).to.equal('hubl.in');
          expect(client_options).to.deep.equals({
            auth_pass: 'secret'
          });

          return newDummyRedisClient();
        }
      });

      this.helpers.mock.pubsub('../../../core/pubsub', {});
      this.helpers
        .requireBackend('core/db/redis')
        .createClient({
          host: 'hubl.in',
          port: 65535,
          client_options: {
            auth_pass: 'secret'
          }
        }, this.helpers.callbacks.noError(done));
    });

    it('should publish the final configuration on the local pubsub', function(done) {
      mockery.registerMock('redis', {
        createClient: function(port, host, client_options) {
          return newDummyRedisClient();
        }
      });

      this.helpers.mock.pubsub('../../../core/pubsub', {});

      require('../../../core/pubsub').local.topic('redis:configurationAvailable').subscribe(function(config) {
        expect(config).to.deep.equal({
          host: 'localhost',
          port: 6379,
          client_options: {}
        });

        done();
      });

      this.helpers
        .requireBackend('core/db/redis')
        .createClient(null, function() {});
    });

  });

});
