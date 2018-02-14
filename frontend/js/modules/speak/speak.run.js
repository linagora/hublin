(function(angular) {
  'use strict';

  angular.module('hublin.speak').run(runBlock);

  function runBlock(speakEventEmitterBuilderService) {
    speakEventEmitterBuilderService();
  }
})(angular);
