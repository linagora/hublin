'use strict';

angular.module('meetingsApplication', [
  'restangular',
  'uuid4',
  'ngRoute',
  'meetings.uri',
  'meetings.session',
  'meetings.user',
  'meetings.conference'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.otherwise({redirectTo: '/'});
  RestangularProvider.setBaseUrl('/');
  RestangularProvider.setFullResponse(true);

});
