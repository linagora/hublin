(function() {
  'use strict';

  angular.module('hublin.i18n')
    .factory('hubI18nService', function($translate, HubI18nString, HUB_I18N_DEFAULT_LOCALE) {
      return {
        getLocale: getLocale,
        translate: translate,
        isI18nString: isI18nString
      };

      function getLocale() {
        return $translate.preferredLanguage() || HUB_I18N_DEFAULT_LOCALE;
      }

      function translate(text) {
        if (!text || text instanceof HubI18nString) {
          return text;
        }

        if (typeof text === 'string') {
          var params = (arguments.length > 1) ? Array.prototype.slice.call(arguments).slice(1) : [];

          return new HubI18nString(text, params);
        }

        throw new TypeError('The input text must be a string or an HubI18nString object');
      }

      function isI18nString(text) {
        return text instanceof HubI18nString;
      }
    });
})();
