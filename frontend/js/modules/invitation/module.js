(function(angular) {
  'use strict';

  angular.module('meetings.invitation', [
    'ngMaterial',
    'meetings.conference',
    'meetings.clipboard',
    'meetings.email',
    'ui.router'
  ]);
})(angular);
