'use strict';

angular.module('liveConferenceApplication', [
  'ngRoute',
  'op.socketio',
  'op.easyrtc',
  'op.websocket',
  'op.live-conference',
  'op.notification',
  'meetings.authentication',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'meetings.invitation.email',
  'restangular',
  'mgcrea.ngStrap'
]).config(function($routeProvider, $locationProvider, RestangularProvider) {

  $routeProvider.when('/:conferenceId', {
    templateUrl: '/views/live-conference/partials/main',
    controller: 'conferenceController',
    resolve: {
      conference: function($route, $location, $log, conferenceService) {
        var id = $route.current.params.conferenceId;
        return conferenceService.enter(id).then(
          function(response) {
            $log.info('Successfully entered room', id, 'with response', response);
            return response.data;
          },
          function(err) {
            $log.info('Failed to enter room', id, err);
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

  $routeProvider.otherwise({redirectTo: '/noop'});

  $locationProvider.html5Mode(true);

  RestangularProvider.setBaseUrl('/');
  RestangularProvider.setFullResponse(true);
})
  .run(['$log', 'session', 'ioConnectionManager', '$route', function($log, session, ioConnectionManager, $route) {
    session.ready.then(function() {
      $log.debug('Session is ready, connecting to websocket', session.user);
      ioConnectionManager.connect();
    });
  }]);
