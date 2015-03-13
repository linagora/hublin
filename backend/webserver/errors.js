'use strict';

var i18n = require('../i18n');

module.exports = function(dependencies) {

  var logger = dependencies('logger');

  function logErrors(err, req, res, next) {
    logger.error('Fatal Error on route', req.path, 'from user', req.user, 'on conference', req.conference, err);
    next(err);
  }

  function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
      return res.json(500, {error: {code: 500, message: 'Server Error', details: i18n.__('Sorry but something bad just happened, developers have been notified')}});
    } else {
      next(err);
    }
  }

  function errorHandler(err, req, res, next) {
    res.status(500);
    return res.render('commons/error', {error: i18n.__('Sorry but something bad just happened, developers have been notified')});
  }

  return {
    logErrors: logErrors,
    clientErrorHandler: clientErrorHandler,
    errorHandler: errorHandler
  };
};
