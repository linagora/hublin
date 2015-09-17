'use strict';

angular.module('meetingsApplication', [
  'restangular',
  'uuid4',
  'ngRoute',
  'op.dynamicDirective',
  'meetings.uri',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'meetings.language',
  'mgcrea.ngStrap'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.otherwise({redirectTo: '/'});
  RestangularProvider.setBaseUrl('/');
  RestangularProvider.setFullResponse(true);

});
