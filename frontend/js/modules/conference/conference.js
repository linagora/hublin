'use strict';

angular.module('meetings.conference', ['meetings.user', 'meetings.uri'])
  .factory('conferenceService', ['$q', 'conferenceAPI', function($q, conferenceAPI) {
    function create(conferenceName, displayName) {
      return conferenceAPI.create(conferenceName, displayName);
    }

    function enter(conferenceName, displayName) {
      return conferenceAPI.get(conferenceName, displayName);
    }

    function addMember() {

    }

    function redirectTo() {

    }

    return {
      create: create,
      enter: enter,
      addMember: addMember,
      redirectTo: redirectTo
    };
  }])
  .factory('conferenceAPI', ['$q', 'Restangular', function($q, Restangular) {
    function getMembers(conferenceId) {
      return Restangular.one('conferences', conferenceId).getList('members');
    }

    function create(id, displayName) {
      return Restangular.one('conferences', id).put({displayName: displayName});
    }

    function getOrCreate(id, displayName) {
      return Restangular.one('conferences', id).get({displayName: displayName});
    }

    function addMembers(id, members) {
      return Restangular.one('conferences', id).customPUT(members);
    }

    function redirectTo(id, tokenUuid) {
      return Restangular.one('conferences').get({token: tokenUuid});
    }

    return {
      create: create,
      getOrCreate: getOrCreate,
      addMembers: addMembers,
      redirectTo: redirectTo,
      getMembers: getMembers
    };
  }])
  .controller('meetingsLandingPageController', ['$scope', '$q', function($scope, $q) {
    console.log('meetingsLandingPageController');
  }])
  .directive('conferenceCreateForm', ['$window', '$log', 'uuid4', 'conferenceService', '$location', 'URI',
    function($window, $log, uuid4, conferenceService, $location, URI) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/conference/conference-create-form.html',
      link: function(scope) {
        function randomizeRoom() {
          return uuid4.generate();
        }

        function buildUrl(room) {
          return URI($location.absUrl())
          .query('')
          .fragment('')
          .segmentCoded(room);
        }

        scope.room = randomizeRoom();
        scope.go = function() {
          $window.location.href = buildUrl(scope.room);
        };
      }
    };
  }])
  .controller('usernameController', ['$scope', 'userService', function($scope, userService) {

    $scope.getDisplayName = function() {
      return userService.getDisplayName();
    };

    $scope.setDisplayName = function() {
      userService.setDisplayName($scope.displayName);
    };

    $scope.username = $scope.getDisplayName();

  }]).directive('usernameForm', [function() {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/live-conference/username-form.html'
    };
}]);
