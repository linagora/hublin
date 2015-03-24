'use strict';


module.exports = function(dependencies) {
  var errors = require('../errors')(dependencies);

  /**
   * Check that an attribute is set in request
   *
   * @param {String} attribute
   * @return {Function}
   */
  function beInRequest(attribute) {
    return function(req, res, next) {
      if (!req[attribute]) {
        throw new errors.BadRequestError(attribute + ' is required in the request');
      }
      next();
    };
  }

  return {
    beInRequest: beInRequest
  };
};
