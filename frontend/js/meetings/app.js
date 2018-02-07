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
  'meetings.conference.constants',
  'meetings.language',
  'mgcrea.ngStrap',
  'pascalprecht.translate'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.otherwise({ redirectTo: '/' });
  RestangularProvider.setBaseUrl('/');
  RestangularProvider.setFullResponse(true);

});
