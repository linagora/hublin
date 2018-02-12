(function(angular) {
  'use strict';

  angular.module('liveConferenceApplication').run(run);

  function run($log, session, conferenceUserMediaInterceptorService) {
    session.ready.then(function() {
      $log.debug('Hublin session is ready');
    });

    conferenceUserMediaInterceptorService();
  }

})(angular);

