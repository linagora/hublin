'use strict';

angular.module('meetings.i18n', ['restangular'])
  .factory('i18nService', ['i18nAPI', function(i18nAPI) {
    function getCatalog(locale) {
      return i18nAPI.getCatalog(locale);
    }

    function __(key, locale) {
      return getCatalog(locale).then(function(catalog) {
        return catalog[key] || key;
      }, function() {
        return key;
      });
    }

    return {
      getCatalog: getCatalog,
      __: __
    };
  }])
  .factory('i18nAPI', ['Restangular', function(Restangular) {
    function getCatalog(locale) {
      return Restangular.oneUrl('i18n/').withHttpConfig({cache: true}).get({locale: locale}).then(function(res) {
        return res.data;
      });
    }

    return {
      getCatalog: getCatalog
    };
  }]);
