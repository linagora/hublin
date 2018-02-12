(function() {
  'use strict';

  angular.module('hublin.i18n')
    .filter('hubI18n', function(hubI18nService) {
      return function(input) {
        return hubI18nService.translate(input).toString();
      };
    });
})();
