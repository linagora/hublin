'use strict';

angular.module('meetings.conference', [])
  .factory('conferenceAPI', ['$q', function($q) {
    function invite(conference) {
      var defer = $q.defer();
      defer.resolve({data: {}});
      return defer.promise;
    }

    function get(id) {
      var defer = $q.defer();
      defer.resolve({data: {_id: id}});
      return defer.promise;
    }

    function getMembers(conference) {
      var defer = $q.defer();
      defer.resolve({data: []});
      return defer.promise;
    }

    return {
      invite: invite,
      get: get,
      getMembers: getMembers
    };
  }]);
