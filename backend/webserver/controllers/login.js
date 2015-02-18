'use strict';

var passport = require('passport');
var url = require('url');

var config = require('../../core').config('default');
var userlogin = require('../../core/user/login');
var logger = require('../../core/logger');

/**
 *
 * @param {object} dependencies
 * @return {{index: index, login: login, user: user}}
 */
module.exports = function(dependencies) {

  function index(req, res) {
    var targetUrl = { pathname: '/', hash: req.user ? '' : '/login' };
    var continueUrl = req.query['continue'];
    if (continueUrl && !req.user) {
      var hashUrl = { pathname: '/login', query: { continue: continueUrl } };
      targetUrl.hash = url.format(hashUrl);
    }
    return res.redirect(url.format(targetUrl));
  }

  function login(req, res, next) {
    if (!req.body.username || !req.body.password) {
      return res.json(400, {
        recaptcha: req.recaptchaFlag || false,
        error: {
          code: 400,
          message: 'Login error',
          details: 'Bad parameters, missing username and/or password'
        }
      });
    }

    var username = req.body.username;

    var strategies = config.auth && config.auth.strategies ? config.auth.strategies : ['local'];
    passport.authenticate(strategies, function(err, user, info) {
      if (err) {
        return next(err);
      }

      if (!user) {
        userlogin.failure(username, function(err, data) {
          if (err) {
            logger.error('Problem while setting login failure for user ' + username, err);
          }
          return res.json(403, {
            recaptcha: req.recaptchaFlag || false,
            error: {
              code: 403,
              message: 'Login error',
              details: 'Bad username or password'
            }
          });
        });
      } else {
        req.logIn(user, function(err) {
          if (err) {
            return next(err);
          }

          userlogin.success(username, function(err, user) {
            if (err) {
              logger.error('Problem while setting login success for user ' + username, err);
            }

            var result = {};
            if (user) {
              result = user.toObject();
              delete result.password;
            }
            return res.json(200, result);
          });
        });
      }
    })(req, res, next);
  }

  function user(req, res) {
    if (!req.user || !req.user.emails || !req.user.emails.length) {
      return res.send(500, {
        error: {
          code: 500,
          message: 'Internal error',
          details: 'User not set'
        }
      });
    }
    return res.json(200, req.user);
  }

  return {
    index: index,
    login: login,
    user: user
  };
};
