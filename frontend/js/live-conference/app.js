'use strict';

angular.module('liveConferenceApplication', [
  'ngRoute',
  'op.socketio',
  'op.easyrtc',
  'op.websocket',
  'op.live-conference',
  'meetings.authentication',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'restangular',
  'mgcrea.ngStrap'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.when('/live', {
    templateUrl: '/views/live-conference/partials/conference',
    controller: 'liveConferenceController',
    resolve: {
      conference: function(conferenceAPI, $route, $location) {
        return conferenceAPI.get(123).then(
          function(response) {
            return response.data;
          },
          function(err) {
            $location.path('/');
          }
        );
      }
    }
  });

  $routeProvider.when('/', {
    templateUrl: '/views/live-conference/partials/username',
    controller: 'usernameController'
  });

  $routeProvider.otherwise({redirectTo: '/'});

  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setFullResponse(true);

})
  .run(['$log', 'session', 'ioConnectionManager', function($log, session, ioConnectionManager) {
    session.ready.then(function() {
      $log.debug('Session is ready, connecting to websocket', session.user);
      ioConnectionManager.connect();
    });
  }]);
