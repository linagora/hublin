'use strict';

const mockery = require('mockery');
const path = require('path');
const helpers = require('../helpers');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

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
