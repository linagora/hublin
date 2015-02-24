'use strict';

/**
 * @param {request} req
 * @param {response} res
 * @param {function} next
 * @return {*}
 */
module.exports.load = function(req, res, next) {

  if (req.user) {
    return next();
  }

  req.user = {
    objectType: 'hublin:anonymous',
    id: 'user'
  };
  return next();
};
