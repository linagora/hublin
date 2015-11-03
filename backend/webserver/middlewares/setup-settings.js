'use strict';

var core = require('../../core'),
  q = require('q'),
  esnConf = require('../../core/esn-config'),
  logger = core.logger;

function fetchDatabaseSettings() {
  return q.Promise(function(resolve, reject) {
    esnConf('web').get(function(err, config) {
      if (err) {
        logger.warn('Can not get web configuration', err);
        return resolve(null);
      } else if (!config) {
        logger.debug('ESN does not have any web settings');
        return resolve(null);
      } else {
        return resolve(config);
      }
    });
  });
}

function setupSettingsMiddleware(req, res, next) {
  var getURL = function() {
    var baseURL;
    if (req.openpaas && req.openpaas.web && req.openpaas.web.base_url) {
      baseURL = req.openpaas.web.base_url;
    } else {
      baseURL = req.protocol + '://' + req.get('host');
    }
    return baseURL;
  };

  fetchDatabaseSettings()
  .then(function(web) {
    req.openpaas = {web: web, getBaseURL: getURL};
    next();
  });
}

/**
 * @type {middleware}
 */
module.exports = setupSettingsMiddleware;
