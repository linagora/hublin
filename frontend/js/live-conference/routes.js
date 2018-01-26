(function(angular) {
  'use strict';

  angular.module('liveConferenceApplication')
    .config(config);

  function config($locationProvider, RestangularProvider, $stateProvider) {
    $stateProvider
      .state('app', {
        url: '/:conferenceId?displayName&autostart&noAutoInvite',
        templateUrl: '/views/live-conference/partials/main',
        controller: 'conferenceController',
        resolve: {
          conference: function($stateParams, $location, $log, conferenceService) {
            var id = $stateParams.conferenceId;

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
        },
        data: {
          hasVideo: false
        }
      })
      .state('app.editor-mobile', {
        templateUrl: '/views/live-conference/partials/conference-mobile-video'
      })
      .state('app.conference', {
        templateUrl: '/views/live-conference/partials/conference-video'
      });

    $locationProvider.html5Mode(true);
    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setFullResponse(true);
  }
})(angular);
