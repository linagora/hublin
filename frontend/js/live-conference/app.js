'use strict';

var angularInjections = angularInjections || [];

angular.module('liveConferenceApplication', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'op.socketio',
  'op.easyrtc',
  'op.websocket',
  'op.live-conference',
  'op.notification',
  'op.localstorage',
  'meetings.authentication',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'meetings.invitation.email',
  'meetings.configuration',
  'meetings.language',
  'meetings.i18n',
  'restangular',
  'uuid4',
  'mgcrea.ngStrap',
  'ngSocial',
  'matchmedia-ng',
  'op.live-conference-devmode',
  'ng.deviceDetector'
].concat(angularInjections)).config(function($routeProvider, $locationProvider, RestangularProvider) {

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

  $locationProvider.html5Mode(true);

  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setFullResponse(true);
})
  .run(['$log', 'session', '$route', function($log, session) {
    session.ready.then(function() {
      $log.debug('Session is ready.');
    });
  }]);
