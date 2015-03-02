'use strict';

angular.module('meetings.conference', ['meetings.user', 'meetings.uri', 'meetings.session'])
  .factory('conferenceService', ['$q', 'conferenceAPI', 'session', function($q, conferenceAPI, session) {
    function create(conferenceName, displayName) {
      return conferenceAPI.create(conferenceName, displayName);
    }

    function enter(conferenceName, displayName) {
      var defer = $q.defer();
      conferenceAPI.get(conferenceName, displayName).then(function(response) {
        session.setConference(response.data);
        defer.resolve(response.data);
      }, function(err) {
        defer.reject(err);
      });
      return defer.promise;
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
  .factory('conferenceAPI', ['$q', '$window', 'Restangular', function($q, $window, Restangular) {
    function get(id) {
      var href = $window.location.origin + '/' + encodeURIComponent(id);
      return Restangular.one('conferences', id).get({displayName: displayName}).then(function(response) {
        response.data.href = href;
        return response;
      });
    }

    function getMembers(conferenceId) {
      return Restangular.one('conferences', conferenceId).getList('members');
    }

    function setMemberDisplayName(id, memberId, displayName) {
      return Restangular.one('conferences', id).one('members', memberId).customPUT({displayName: displayName});
    }

    function create(id, displayName) {
      return Restangular.one('conferences', id).put({displayName: displayName});
    }

    function getOrCreate(id, displayName) {
      return Restangular.one('conferences', id).get({displayName: displayName});
    }

    function addMembers(id, members) {
      return Restangular.one('conferences', id).all('members').customPUT(members);
    }

    function redirectTo(id, tokenUuid) {
      return Restangular.one('conferences').get({token: tokenUuid});
    }

    return {
      get: get,
      create: create,
      getOrCreate: getOrCreate,
      addMembers: addMembers,
      redirectTo: redirectTo,
      getMembers: getMembers,
      setMemberDisplayName: setMemberDisplayName
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

        function escapeRoomName(room) {
          var result = room.replace(/\s+/g, '');

          //removes all url associated characters : , / ? : @ & = + $ #
          result = result.replace(/[,\/\?:@&=\+\$#]+/g, '');

          var blackList = ['api'];
          if (blackList.indexOf(result) >= 0) { result = ''; }

          return result;
        }

        scope.go = function() {
          var escapedName = escapeRoomName(scope.room);
          if (escapedName === '') {
            $window.location.href = buildUrl(randomizeRoom());
          }
          else {
            $window.location.href = buildUrl(escapedName);
          }
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
  }]).directive('browserAuthorizationDialog', ['$window', function($window) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/live-conference/browser-authorization-dialog.html',
      replace: true,
      link: function(scope, element) {
        $window.easyrtc.setGotMedia(function(gotMediaCB, errorText) {
          element.modal('hide');
        });

        var oldGetUserMedia = $window.getUserMedia;
        $window.getUserMedia = function getUserMedia(constraints, successCallback, errorCallback) {
          element.modal('show');
          oldGetUserMedia(constraints, successCallback, errorCallback);
        };
      }
    };
  }]);
