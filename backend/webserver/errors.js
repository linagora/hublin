// do not 'use strict' here, otherwise we can't use arguments.callee in the error traces.

var i18n = require('../i18n');
var util = require('util');

/**
 * Constructs a new HttpError. Throwing this in the webserver will trickle down
 * to the error handler and will be displayed to the client as a json error. It
 * should be made sure that the webserver uses express-domain-middleware to
 * make sure async errors are correctly caught.
 *
 * Example:
 *   throw new HttpError(404, 'Not Found', 'I lost it');
 *
 * Note also that details may be an error string, a Javascript Error instance,
 * or even a nested instance of HttpError. In the latter case code and message
 * are taken from this constructor call, but the details are taken from the
 * nested HttpError.
 *
 * @param {Number} code      The HTTP error code, e.g. 404
 * @param {String} message   The HTTP error message, e.g. "Not Found"
 * @param {String} details   The error details
 */
function HttpError(code, message, details) {
  Error.call(this, message); // jshint ignore:line

  this.name = this.constructor.name;
  if (details instanceof HttpError) {
    this.code = code;
    this.message = message;
    this.details = details.details;
  } else {
    this.code = code;
    this.message = message;
    this.details = (details instanceof Error ? details.message : details);
  }
}
util.inherits(HttpError, Error);

/**
 * Send this error as a JSON result through the express result object.
 *
 * @param {Result} res      The express result object.
 */
HttpError.prototype.send = function(res) {
  'use strict';
  res.json(this.code, {
    error: {
      code: this.code,
      message: this.message,
      details: this.details
    }
  });
};

/**
 * A subclass of HttpError for 400 Bad Request
 *
 * @see HttpError
 * @param {String} details   The error details
 */
function BadRequestError(details) {
  Error.captureStackTrace(this, arguments.callee); // jshint ignore:line
  HttpError.call(this, 400, 'Bad Request', details);
}
util.inherits(BadRequestError, HttpError);

/**
 * A subclass of HttpError for 403 Forbidden
 *
 * @see HttpError
 * @param {String} details   The error details
 */
function ForbiddenError(details) {
  Error.captureStackTrace(this, arguments.callee); // jshint ignore:line
  HttpError.call(this, 403, 'Forbidden', details);
}
util.inherits(ForbiddenError, HttpError);

/**
 * A subclass of HttpError for 404 Not Found
 *
 * @see HttpError
 * @param {String} details   The error details
 */
function NotFoundError(details) {
  Error.captureStackTrace(this, arguments.callee); // jshint ignore:line
  HttpError.call(this, 404, 'Not Found', details);
}
util.inherits(NotFoundError, HttpError);

/**
 * A subclass of HttpError for 500 Internal Server Error
 *
 * @see HttpError
 * @param {String} details   The error details
 */
function ServerError(details) {
  Error.captureStackTrace(this, arguments.callee); // jshint ignore:line
  HttpError.call(this, 500, 'Internal Server Error', details);
}
util.inherits(ServerError, HttpError);

/**
 * Module definition for errors
 */
module.exports = function(dependencies) {
  'use strict';

  var logger = dependencies('logger');

  function logErrors(err, req, res, next) {
    if (!(err instanceof HttpError)) {
      logger.error('Fatal Error on route', req.path, 'from user', req.user, 'on conference', req.conference, err);
    }
    next(err);
  }

  function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
      apiErrorHandler(err, req, res, next);
    } else {
      next(err);
    }
  }

  function apiErrorHandler(err, req, res, next) {
    if (!(err instanceof HttpError)) {
      logger.error('API error occurred: %e', err);
      var details = i18n.__('Sorry but something bad just happened, developers have been notified');
      details += '\n ' + err.stack;
      err = new ServerError(details);
    }
    err.send(res);
  }

  function errorHandler(err, req, res, next) {
    res.status(500);
    var details = i18n.__('Sorry but something bad just happened, developers have been notified');
    details += '\n ' + err.stack;
    return res.render('commons/error', {error: details});
  }

  return {
    logErrors: logErrors,
    clientErrorHandler: clientErrorHandler,
    apiErrorHandler: apiErrorHandler,
    errorHandler: errorHandler,

    HttpError: HttpError,
    BadRequestError: BadRequestError,
    ForbiddenError: ForbiddenError,
    NotFoundError: NotFoundError,
    ServerError: ServerError
  };
};
