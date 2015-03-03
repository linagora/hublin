'use strict';

/**
 * Check that an attribute is set in request
 *
 * @param {String} attribute
 * @return {Function}
 */
module.exports.beInRequest = function(attribute) {
  return function(req, res, next) {
    if (!req[attribute]) {
      return res.json(400, {
        error: {
          code: 400,
          message: 'Bad request',
          details: attribute + ' is required in request'
        }
      });
    }
    return next();
  };
};
