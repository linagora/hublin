'use strict';

const i18n = require('../core/i18n');
const pug = require('pug');

const i18nConfig = {
  multiDirectories: true,
  directory: __dirname + '/locales',
  locales: ['de', 'en', 'fr', 'vi', 'zh']
};

i18n.setDefaultConfiguration(i18nConfig);

const mashpieInit = i18n.init;

i18n.init = function(req, res, next) {

  /**
   * Extra preprocessor that passes each argument through the jade preprocessor
   *
   * @see i18n.__
   */
  res.locals.__j = function(/* phrase, ...args */) {
    const args = Array.prototype.map.call(arguments, function(v, i) {
      return (i > 0 ? pug.compile(v)({}) : v);
    });
    return res.locals.__.apply(res.locals, args);
  };

  return mashpieInit.apply(this, arguments);
};

/**
 * Return configured {@link https://github.com/mashpie/i18n-node} object.
 */
module.exports = i18n;
