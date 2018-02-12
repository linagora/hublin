(function() {
  'use strict';

  angular.module('hublin.i18n')
  .factory('hubI18nInterpolator', hubI18nInterpolator);

  function hubI18nInterpolator() {
    return {
      setLocale: function() {},
      getInterpolationIdentifier: function() {
        return 'hubI18nInterpolator';
      },
      interpolate: function(string, interpolateParams) {
        return string.replace(/(%s)/g, function() {
          return interpolateParams.shift();
        });
      }
    };
  }
})();
