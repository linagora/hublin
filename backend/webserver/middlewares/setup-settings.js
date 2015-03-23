'use strict';

var core = require('../../core'),
  mongo = core.db.mongo,
  topic = core.pubsub.local.topic('mongodb:connectionAvailable'),
  esnConf = require('../../core/esn-config'),
  logger = core.logger;

var web = {};

function setupSettings() {
  var setSettings = function() {
    logger.info('MongoDB is connected, setting up Web configuration');

    esnConf('web').get(function(err, config) {
      if (err) {
        logger.warn('Can not get web configuration', err);
        return;
      }

      if (!config) {
        logger.info('ESN does not have any web settings');
        return;
      }
      web = config || web;
    });
  };

  if (mongo.isConnected()) {
    setSettings();
  }
  topic.subscribe(setSettings);
}

function middleware() {
  setupSettings();

  return function(req, res, next) {
    var getURL = function() {
      var baseURL;
      if (req.openpaas && req.openpaas.web && req.openpaas.web.base_url) {
        baseURL = req.openpaas.web.base_url;
      } else {
        baseURL = req.protocol + '://' + req.get('host');
      }
      return baseURL;
    };
    req.openpaas = {web: web, getBaseURL: getURL};
    next();
  };
}
/**
 * @type {middleware}
 */
module.exports = middleware;
