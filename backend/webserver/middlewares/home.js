'use strict';

var conferenceHelpers = require('../../core/conference/helpers');
var i18n = require('../../i18n');

/**
 * @param {dependencies} dependencies
 * @return {{checkIdForCreation: checkIdForCreation}}
 */
module.exports = function(dependencies) {

  function checkIdForCreation(req, res, next) {
    var confId = req.params.id;

    if (conferenceHelpers.isIdForbidden(confId)) {
      return res.render('commons/error', {error: i18n.__('This room name is forbidden for technical reason:') + confId});
    }
    next();
  }

  return {
    checkIdForCreation: checkIdForCreation
  };
};

