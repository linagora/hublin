(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .directive('autoVideoSwitcher', autoVideoSwitcher);

  function autoVideoSwitcher($rootScope, AutoVideoSwitcher, currentConferenceState) {
    return {
      restrict: 'A',
      link: link
    };

    function link() {
      var unreg = $rootScope.$on('localMediaStream', function() {
        unreg();
        new AutoVideoSwitcher(currentConferenceState);
      });
    }
  }
})(angular);
