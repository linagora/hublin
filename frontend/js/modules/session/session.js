'use strict';

angular.module('meetings.session', ['ngRoute', 'ngCookies'])
  .factory('session', ['$q', function($q) {

    var bootstrapDefer = $q.defer();
    var initializedDefer = $q.defer();
    var session = {
      user: {},
      ready: bootstrapDefer.promise,
      initialized: initializedDefer.promise
    };

    var sessionIsBootstraped = false;
    function checkBootstrap() {
      if (sessionIsBootstraped) {
        return;
      }
      if (session.user) {
        sessionIsBootstraped = true;
        bootstrapDefer.resolve(session);
      }
    }

    function setUser(user) {
      angular.copy(user, session.user);
      checkBootstrap();
    }
    session.setUser = setUser;

    session.getUsername = function() {
      return 'Anonymous';
    };

    session.setUserName = function(name) {
      initializedDefer.resolve(session.user);
    };

    session.getUserId = function() {
      return '123';
    };

    return session;
  }])
  .factory('sessionFactory', ['$log', '$cookies', 'session', function($log, $cookies, session) {
    return {
      fetchUser: function(callback) {
        if ($cookies.user) {
          var user = JSON.parse($cookies.user);
          $log.debug('Got the user from cookie', user);
          session.setUser(user);
        }
        return callback();
      }
    };
  }])
 .controller('sessionInitLiveConferenceController', ['$scope', 'sessionFactory', function($scope, sessionFactory) {

    $scope.session = {
      template: '/views/commons/loading.html'
    };

    sessionFactory.fetchUser(function(error) {
      if (error) {
        $scope.session.error = error.data;
        $scope.session.template = '/views/commons/loading-error.html';
      } else {
        $scope.session.template = '/views/live-conference/partials/container.html';
      }
    });
  }])
  .controller('sessionInitMeetingsController', ['$scope', function($scope) {

    $scope.session = {
      template: '/views/meetings/partials/landing-page.html'
    };

  }]);
