'use strict';

angular.module('meetingsApplication', [
  'ngRoute',
  'op.socketio',
  'op.easyrtc',
  'op.websocket',
  'restangular',
  'meetings.authentication',
  'meetings.session'
  ]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.when('/', {
    templateUrl: '/views/application'
  });

  $routeProvider.otherwise({redirectTo: '/'});

  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setFullResponse(true);

})
  .run(['session', 'ioConnectionManager', function(session, ioConnectionManager) {
    session.ready.then(function() {
      ioConnectionManager.connect();
    });
  }]);
