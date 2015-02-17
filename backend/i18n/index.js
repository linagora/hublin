'use strict';

var i18n = require('i18n');
i18n.configure(
  {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    directory: __dirname + '/locales',
    updateFiles: false,
    indent: '  ',
    extension: '.json',
    cookie: 'locale'
  }
);

/**
 * Return configured {@link https://github.com/mashpie/i18n-node} object.
 */
module.exports = i18n;
