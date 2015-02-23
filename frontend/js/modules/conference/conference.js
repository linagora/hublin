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
  .factory('conferenceAPI', ['Restangular', function(Restangular) {
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
      create: create,
      getOrCreate: getOrCreate,
      addAttendee: addAttendee,
      redirectTo: redirectTo
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
