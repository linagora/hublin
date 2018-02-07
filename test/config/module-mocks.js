'use strict';

angular.module('pascalprecht.translate', [])
  .filter('translate', function() {
    return function(input) { return input; };
  })
  .factory('$translate', function() {
    return {
      instant: function(input, params) {return input;}
    };
  });
