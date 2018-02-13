(function(angular) {
  'use strict';

  /**
   * https://github.com/otalk/hark
   *
   * returns a hark instance
   *
   * detector.on('speaking', function() {...});
   * detector.on('stopped_speaking', function() {...});
   *
   * don't forget to call detector.stop();
   */
  angular.module('hublin.speak').constant('hark', window.hark);

})(angular);
