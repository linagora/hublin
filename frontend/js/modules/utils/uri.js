'use strict';

angular.module('meetings.uri', [])
  .factory('URI', ['$window', function($window) {
    return $window.URI;
  }]);
