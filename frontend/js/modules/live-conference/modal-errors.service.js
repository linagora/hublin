(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('conferenceErrorDialogsService', conferenceErrorDialogsService);

  function conferenceErrorDialogsService($mdDialog, $window) {
    return {
      onConnectError: onConnectError
    };

    function onConnectError() {
      var confirm = $mdDialog.confirm()
        .clickOutsideToClose(true)
        .title('Connection Error')
        .textContent('Your browser failed to connect to Hubl.in, reload the page to try again')
        .ok('Reload')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        $window.location.reload();
      });
    }
  }
})(angular);
