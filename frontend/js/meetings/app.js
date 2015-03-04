'use strict';

angular.module('meetingsApplication', [
  'restangular',
  'uuid4',
  'ngSocial',
  'ngRoute',
  'meetings.uri',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'mgcrea.ngStrap'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.otherwise({redirectTo: '/'});
  RestangularProvider.setBaseUrl('/');
  RestangularProvider.setFullResponse(true);

});
