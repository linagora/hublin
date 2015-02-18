'use strict';

var passport = require('passport');
var config = require('../../core').config('default');

/**
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @return {*}
 */
exports.loginAndContinue = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login?continue=' + encodeURIComponent(req.originalUrl));
};

/**
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @return {*}
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};

/**
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @return {*}
 */
exports.requiresAPILogin = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  if (config.auth && config.auth.strategies && config.auth.strategies.indexOf('bearer') !== -1) {
    return passport.authenticate('bearer', { session: false })(req, res, next);
  } else {
    return res.json(401, {
      error: {
        code: 401,
        message: 'Login error',
        details: 'Please log in first'
      }
    });
  }
};

/**
 * Checks that the current request user is the current request domain manager
 *
 * @param {Requets} req
 * @param {Response} res
 * @param {Function} next
 * @return {*}
 */
exports.requiresDomainManager = function(req, res, next) {
  if (!req.user || !req.domain || !req.user._id || !req.domain.administrator) {
    return res.json(400, {error: 400, message: 'Bad request', details: 'Missing user or domain'});
  }

  if (!req.domain.administrator.equals(req.user._id)) {
    return res.json(403, {error: 403, message: 'Forbidden', details: 'User is not the domain manager'});
  }
  next();
};

var requiresDomainMember = function(req, res, next) {
  if (!req.user || !req.domain) {
    return res.json(400, {error: 400, message: 'Bad request', details: 'Missing user or domain'});
  }

  if (req.domain.administrator && req.domain.administrator.equals(req.user._id)) {
    return next();
  }

  if (!req.user.domains || req.user.domains.length === 0) {
    return res.json(403, {error: 403, message: 'Forbidden', details: 'User does not belongs to the domain'});
  }

  var belongs = req.user.domains.some(function(domain) {
    return domain.domain_id.equals(req.domain._id);
  });

  if (!belongs) {
    return res.json(403, {error: 403, message: 'Forbidden', details: 'User does not belongs to the domain'});
  }
  next();
};
/**
 * @type {Function}
 */
module.exports.requiresDomainMember = requiresDomainMember;

/**
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @return {*}
 */
exports.requiresCommunityCreator = function(req, res, next) {
  if (!req.community) {
    return res.json(400, {error: 400, message: 'Bad request', details: 'Missing community'});
  }

  if (!req.user) {
    return res.json(400, {error: 400, message: 'Bad request', details: 'Missing user'});
  }

  if (!req.community.creator.equals(req.user._id)) {
    return res.json(403, {error: 403, message: 'Forbidden', details: 'User is not the community creator'});
  }
  next();
};
