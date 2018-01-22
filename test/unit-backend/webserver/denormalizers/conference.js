const {expect} = require('chai');
const mockery = require('mockery');
const sinon = require('sinon');
const logger = require('../../../fixtures/logger-noop');

describe('The conference denormalizer', function() {
  var dependencies;

  beforeEach(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };
  });

  describe('The denormalize function', function() {
    it('should not add iceServers configuration when not configured', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback();
        }
      }));

      mockery.registerMock('../../core/esn-config', configSpy);
      const denormalizer = this.helpers.requireBackend('webserver/denormalizers/conference')(dependencies);
      const conference = {};

      denormalizer.denormalize(conference).then(denormalized => {
        expect(denormalized.iceServers).to.be.falsy;
        expect(configSpy).to.have.been.calledWith('iceservers');
        done();
      }).catch(done);
    });

    it('should not add iceServers when configuration fetch fails', function(done) {
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback(new Error());
        }
      }));

      mockery.registerMock('../../core/esn-config', configSpy);
      const denormalizer = this.helpers.requireBackend('webserver/denormalizers/conference')(dependencies);
      const conference = {};

      denormalizer.denormalize(conference).then(denormalized => {
        expect(denormalized.iceServers).to.be.falsy;
        expect(configSpy).to.have.been.calledWith('iceservers');
        done();
      }).catch(done);
    });

    it('should add an iceServers from configuration', function(done) {
      const servers = ['foo', 'bar', 'baz'];
      const configSpy = sinon.spy(() => ({
        get: function(callback) {
          callback(null, { servers });
        }
      }));

      mockery.registerMock('../../core/esn-config', configSpy);
      const denormalizer = this.helpers.requireBackend('webserver/denormalizers/conference')(dependencies);
      const conference = {};

      denormalizer.denormalize(conference).then(denormalized => {
        expect(denormalized.iceServers).to.equal(servers);
        expect(configSpy).to.have.been.calledWith('iceservers');
        done();
      }).catch(done);
    });
  });
});
