'use strict';

var mockery = require('mockery');

beforeEach(function() {
  mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
  mockery.registerMock('./logger', require('../fixtures/logger-noop')());
});

afterEach(function() {
  mockery.resetCache();
  mockery.deregisterAll();
  mockery.disable();
});
