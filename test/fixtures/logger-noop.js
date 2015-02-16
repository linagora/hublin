'use strict';

var noop = function() {};
module.exports = function() {
  return {
    log: noop,
    warn: noop,
    error: noop,
    debug: noop,
    info: noop
  };
};
