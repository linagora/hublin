'use strict';

var mockery = require('mockery');
var expect = require('chai').expect;

describe('The setup-settings middleware', function() {

  it('should try to load the web configuration file', function(done) {
    var esnMock = function(confKey) {
      expect(confKey).to.equal('web');
      done();
      return {
        get: function() {}
      };
    };
    mockery.registerMock('../../core/esn-config', esnMock);

    var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
    mw({}, {}, function() {});
  });

  it('should populate the req.openpaas object with configuration results', function(done) {
    var esnMock = function(confKey) {
      return {
        get: function(callback) {
          return callback(null, {test: true});
        }
      };
    };
    mockery.registerMock('../../core/esn-config', esnMock);
    var req = {};
    var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
    mw(req, {}, function() {
      expect(req.openpaas).to.exist;
      expect(req.openpaas.web).to.deep.equal({test: true});
      done();
    });
  });

  it('should call next() even if datastore request fails', function(done) {
    var esnMock = function(confKey) {
      return {
        get: function(callback) {
          return callback(new Error('test error'));
        }
      };
    };
    mockery.registerMock('../../core/esn-config', esnMock);
    var req = {};
    var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
    mw(req, {}, function() {
      expect(req.openpaas).to.exist;
      expect(req.openpaas.web).to.be.null;
      done();
    });
  });

  it('should call next() even if document configuration does not exist', function(done) {
    var esnMock = function(confKey) {
      return {
        get: function(callback) {
          return callback();
        }
      };
    };
    mockery.registerMock('../../core/esn-config', esnMock);
    var req = {};
    var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
    mw(req, {}, function() {
      expect(req.openpaas).to.exist;
      expect(req.openpaas.web).to.be.null;
      done();
    });
  });

  it('should expose a getBaseURL method on req.openpaas', function(done) {
    var esnMock = function(confKey) {
      return {
        get: function(callback) {
          return callback();
        }
      };
    };
    mockery.registerMock('../../core/esn-config', esnMock);
    var req = {};
    var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
    mw(req, {}, function() {
      expect(req.openpaas).to.exist;
      expect(req.openpaas.getBaseURL).to.be.a('function');
      done();
    });
  });

  describe('getBaseURL() method', function() {
    it('should return the base_url property of the web configuration document, if it exists', function(done) {
      var esnMock = function(confKey) {
        return {
          get: function(callback) {
            return callback(null, {base_url: 'https://hubl.out/'});
          }
        };
      };
      mockery.registerMock('../../core/esn-config', esnMock);
      var req = {};
      var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
      mw(req, {}, function() {
        expect(req.openpaas.getBaseURL()).to.equal('https://hubl.out/');
        done();
      });
    });

    it('should build the URL from req data', function(done) {
      var esnMock = function(confKey) {
        return {
          get: function(callback) {
            return callback();
          }
        };
      };
      mockery.registerMock('../../core/esn-config', esnMock);
      var req = {
        protocol: 'https',
        get: function() {
          return 'hubl.in.out';
        }
      };
      var mw = require(this.testEnv.basePath + '/backend/webserver/middlewares/setup-settings');
      mw(req, {}, function() {
        var url = req.openpaas.getBaseURL();
        expect(url).to.equal('https://hubl.in.out');
        done();
      });
    });
  });

});
