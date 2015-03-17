'use strict';

var conference = require('../../core/conference');
var conferenceHelpers = require('../../core/conference/helpers');
var i18n = require('../../i18n');

/**
 * @param {dependencies} dependencies
 * @return {{checkIdForCreation: checkIdForCreation}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger');

  function checkIdForCreation(req, res, next) {
    var confId = req.params.id;

    if (conferenceHelpers.isIdForbidden(confId)) {
      return res.render('commons/error', {error: i18n.__('The room name %s is forbidden for technical reason', confId)});
    }
    next();
  }

  function checkIdLength(req, res, next) {
    var confId = req.params.id;

    if (conferenceHelpers.isIdTooShort(confId) || conferenceHelpers.isIdTooLong(confId)) {
      return res.render('commons/error', {error: i18n.__('The room name %s is forbidden for technical reason', confId)});
    }
    next();
  }

  function load(req, res, next) {
    conference.get(req.params.id, function(err, conf) {
      if (err) {
        logger.error('Error while loading conference', err);
        return res.render('commons/error', {error: i18n.__('Error while loading conference:') + req.params.id});
      }

      if (conf) {
        req.conference = conf;
      }
      return next();
    });
  }

  return {
    checkIdForCreation: checkIdForCreation,
    checkIdLength: checkIdLength,
    load: load
  };
};

