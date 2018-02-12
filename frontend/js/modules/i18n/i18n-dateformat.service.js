(function() {
  'use strict';

  angular.module('hublin.i18n')
  .factory('hubI18nDateFormatService', hubI18nDateFormatService);

  function hubI18nDateFormatService(hubI18nService, HUB_I18N_DATE_FORMAT, HUB_I18N_DEFAULT_LOCALE) {
    return {
      getDateFormat: getDateFormat
    };

    function getDateFormat() {
      return HUB_I18N_DATE_FORMAT[hubI18nService.getLocale().substring(0, 2)] || HUB_I18N_DATE_FORMAT[HUB_I18N_DEFAULT_LOCALE];
    }
  }
})();
