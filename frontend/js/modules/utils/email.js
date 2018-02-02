(function(angular) {
  'use strict';

  angular.module('meetings.email', [])
    .factory('emailAddressesWrapper', function($window) {
      return $window.emailAddresses;
    })

    .factory('emailIsValid', function(emailAddressesWrapper) {
      return function(email) {
        return !!emailAddressesWrapper.parseOneAddress(email);
      };
    })
;})(angular);
