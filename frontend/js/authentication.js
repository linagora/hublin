'use strict';

angular.module('meetings.authentication', [])
  .factory('tokenAPI', ['$q', function($q) {

    function getNewToken() {
      var token = 123;
      var defer = $q.defer();
      defer.resolve({data: {token: token}});
      return defer.promise;
    }

    return {
      getNewToken: getNewToken
    };
  }]);
