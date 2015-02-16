'use strict';

module.exports = function(dependencies) {

  function passThrough(req, res, next) {
    next();
  }

  return {
    passThrough: passThrough
  };
};
