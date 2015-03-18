'use strict';

angular.module('meetings.session', ['ngRoute', 'ngCookies'])
  .factory('session', ['$rootScope', '$q', function($rootScope, $q) {

    var bootstrapDefer = $q.defer();
    var initializedDefer = $q.defer();
    var goodbyeDefer = $q.defer();
    var session = {
      user: {},
      conference: {},
      ready: bootstrapDefer.promise,
      initialized: initializedDefer.promise,
      goodbye: goodbyeDefer.promise
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

    function setConference(conference) {
      angular.copy(conference, session.conference);
    }
    session.setConference = setConference;

    session.getUsername = function() {
      return session.user ? session.user.displayName : 'Anonymous';
    };

    session.getUserId = function() {
      return session.user ? session.user._id : null;
    };

    session.setConfigured = function(success) {
      if (!success) {
        initializedDefer.reject(session.user);
      } else {
        initializedDefer.resolve(session.user);
      }
    };

    session.leave = function() {
      goodbyeDefer.resolve();
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
  }]);
