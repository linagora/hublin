'use strict';

angular.module('meetings.conference', [])
  .factory('conferenceService', ['$q', 'conferenceAPI', function($q, conferenceAPI) {
    function create() {

    }

    function enter() {

    }

    function addAttendee() {

    }

    function redirectTo() {

    }

    return {
      create: create,
      enter: enter,
      addAttendee: addAttendee,
      redirectTo: redirectTo
    };
  }])
  .factory('conferenceAPI', ['$q', 'Restangular', function($q, Restangular) {
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

    function create(id, displayName) {
      return Restangular.one('conferences', id).put({displayName: displayName});
    }

    function getOrCreate(id, displayName) {
      return Restangular.one('conferences', id).get({displayName: displayName});
    }

    function addAttendee(id, attendee) {
      return Restangular.one('conferences', id).customPUT(attendee);
    }

    function redirectTo(id, tokenUuid) {
      return Restangular.one('conferences').get({token: tokenUuid});
    }

    return {
      get: get,
      create: create,
      getOrCreate: getOrCreate,
      addAttendee: addAttendee,
      redirectTo: redirectTo,
      getMembers: getMembers
    };
  }])
  .controller('meetingsLandingPageController', ['$scope', '$q', function($scope, $q) {
    console.log('meetingsLandingPageController');
  }])
  .directive('conferenceCreateForm', ['uuid4', function(uuid4) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/conference/conference-create-form.html',
      link: function(scope) {
        function randomizeRoom() {
          return uuid4.generate();
        }
        scope.room = randomizeRoom();
      }
    };
  }]);
