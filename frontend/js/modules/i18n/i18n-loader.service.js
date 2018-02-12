(function() {
  'use strict';

  angular.module('hublin.i18n')
    .factory('hubI18nLoader', hubI18nLoader);

  function hubI18nLoader(Restangular) {
    return function(options) {
      return Restangular.oneUrl('i18n/').withHttpConfig({ cache: true }).get({ locale: options.key }).then(function(res) {
        return res.data;
      });
    };
  }
})();
