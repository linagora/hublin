'use strict';

var user = require('../../core/user');

/**
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @return {*}
 */
exports.create = function(req, res, next) {
  if (!req.body.email) {
    return res.json(400, {
      error: {
        code: 400,
        message: 'Bad request',
        details: 'An email is required'
      }
    });
  }

  if (!req.body.displayName) {
    return res.json(400, {
      error: {
        code: 400,
        message: 'Bad request',
        details: 'A displayName is required'
      }
    });
  }

  user.save({ emails: [req.body.email], displayName: req.body.displayName })
    .then(function(saved) {
      req.user = saved;
      next();
    })
    .catch (function(err) {
      res.json(400, {
        error: {
          code: 500,
          message: 'Server error',
          details: err.message
        }
      });
    });
};
