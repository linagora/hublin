'use strict';

var i18n = require('i18n');
var jade = require('jade');
i18n.configure(
  {
    defaultLocale: 'en',
    locales: ['de', 'en', 'fr', 'vi', 'zh'],
    directory: __dirname + '/locales',
    updateFiles: false,
    indent: '  ',
    extension: '.json',
    cookie: 'locale'
  }
);

var mashpieInit = i18n.init;
i18n.init = function(req, res, next) {

  /**
   * Extra preprocessor that passes each argument through the jade preprocessor
   *
   * @see i18n.__
   */
  res.locals.__j = function(/* phrase, ...args */) {
    var args = Array.prototype.map.call(arguments, function(v, i) {
      return (i > 0 ? jade.compile(v)({}) : v);
    });
    return res.locals.__.apply(res.locals, args);
  };

  return mashpieInit.apply(this, arguments);
};

/**
 * Return configured {@link https://github.com/mashpie/i18n-node} object.
 */
module.exports = i18n;
