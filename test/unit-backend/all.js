'use strict';

var mockery = require('mockery'),
    path = require('path'),
    helpers = require('../helpers');

before(function() {
  var basePath = path.resolve(__dirname + '/../..');
  this.testEnv = {
    basePath: basePath,
    fixtures: path.resolve(__dirname + '/fixtures'),
    initCore: function(callback) {
      var core = require(basePath + '/backend/core');
      core.init(function() {
        if (callback) {
          process.nextTick(callback);
        }
      });
      return core;
    }
  };
  this.helpers = {};
  helpers(this.helpers, this.testEnv);
  process.env.NODE_CONFIG = this.testEnv.tmp;
  process.env.NODE_ENV = 'test';
});

beforeEach(function() {
  mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
  mockery.registerMock('./logger', require('../fixtures/logger-noop')());
  mockery.registerMock('../../../core/logger', require('../fixtures/logger-noop')());
});

afterEach(function() {
  mockery.resetCache();
  mockery.deregisterAll();
  mockery.disable();
});
