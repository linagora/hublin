'use strict';

/**
 * Fake middleware for testing purposes
 * @param {object} dependencies
 * @return {{passThrough: passThrough}}
 */
module.exports = function(dependencies) {

  function passThrough(req, res, next) {
    next();
  }

  return {
    passThrough: passThrough
  };
};
