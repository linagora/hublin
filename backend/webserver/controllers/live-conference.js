'use strict';

var i18n = require('../../i18n');

/**
 *
 * @param {object} dependencies
 * @return {{open: open}}
 */
module.exports = function(dependencies) {

  function open(req, res) {
    return res.render('live-conference/index', {
      title: i18n.__('Conference')
    });
  }

  return {
    open: open
  };
};
