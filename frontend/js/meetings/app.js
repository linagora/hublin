'use strict';

angular.module('meetingsApplication', [
  'restangular',
  'uuid4',
  'ngRoute',
  'meetings.session',
  'meetings.conference'
]).config(function($routeProvider, RestangularProvider) {

  $routeProvider.otherwise({redirectTo: '/'});

  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setFullResponse(true);

});
