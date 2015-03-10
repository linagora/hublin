'use strict';

var mockery = require('mockery'),
    chai = require('chai'),
    expect = chai.expect;

var defaultConfig = [
  {
    type: 'ws',
    url: ''
  }
];

var expectConfiguration = function(done, config) {
  return function(err, conference) {
    expect(err).to.not.exist;
    expect(conference).to.deep.equals({
      configuration: {
        hosts: config
      }
    });

    done();
  };
};

describe('The scalability module for conferences', function() {

  it('should read its configuration from esn-config', function(done) {
    mockery.registerMock('../esn-config', function(setting) {
      return {
        get: function() {
          done();
        }
      };
    });

    this.helpers.requireBackend('core/conference/scalability.js')();
  });

  it('should use default configuration if nothing is defined in esn-config', function(done) {
    mockery.registerMock('../esn-config', function(setting) {
      return {
        get: function(callback) {
          return callback();
        }
      };
    });

    this.helpers.requireBackend('core/conference/scalability.js')({}, expectConfiguration(done, defaultConfig));
  });

  it('should use default configuration if esn-config fails', function(done) {
    mockery.registerMock('../esn-config', function(setting) {
      return {
        get: function(callback) {
          return callback(new Error('WTF'));
        }
      };
    });

    this.helpers.requireBackend('core/conference/scalability.js')({}, expectConfiguration(done, defaultConfig));
  });

  it('should use specific configuration if present', function(done) {
    var config = [
      {
        type: 'ws',
        url: 'ws.hubl.in'
      },
      {
        type: 'turn',
        url: 'turn:turn01.hubl.in?transport=udp'
      },
      {
        type: 'turn',
        url: 'turn:turn02.hubl.in?transport=tcp'
      }
    ];

    mockery.registerMock('../esn-config', function(setting) {
      return {
        get: function(callback) {
          return callback(null, config);
        }
      };
    });

    this.helpers.requireBackend('core/conference/scalability.js')({}, expectConfiguration(done, config));
  });

});
