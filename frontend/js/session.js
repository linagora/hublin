'use strict';

angular.module('meetings.session', ['ngRoute'])
  .factory('session', ['$q', function($q) {

    var bootstrapDefer = $q.defer();
    var session = {
      user: {},
      ready: bootstrapDefer.promise
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

    return session;
  }])
  .factory('sessionFactory', ['session', function(session) {
    return {
      fetchUser: function(callback) {
        var user = {id: 'you@lng.com'};
        session.setUser(user);
        return callback();
      }
    }
  }])
 .controller('sessionInitLiveConferenceController', ['$scope', 'sessionFactory', '$route', function($scope, sessionFactory) {

    $scope.session = {
      template: '/views/commons/loading.html'
    };

    sessionFactory.fetchUser(function(error) {
      if (error) {
        $scope.session.error = error.data;
        $scope.session.template = '/views/commons/loading-error.html';
      } else {
        $scope.session.template = '/views/partials/conference.html';
      }
    });
  }]);
