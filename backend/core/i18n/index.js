'use strict';

const i18n = require('i18n');

const i18nConfigTemplate = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'vi'],
  updateFiles: false,
  indent: '  ',
  extension: '.json',
  cookie: 'locale'
};

/**
 * Set default configuration for i18n
 *
 * @param {Object} options - Object contains attributes which will be overrided or added into i18nConfig
 */
function setDefaultConfiguration(options) {
  const i18nConfig = Object.assign({}, i18nConfigTemplate, options);

  i18n.configure(i18nConfig);
}

module.exports = i18n;
module.exports.setDefaultConfiguration = setDefaultConfiguration;
