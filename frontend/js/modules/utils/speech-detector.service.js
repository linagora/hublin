(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('speechDetector', speechDetector);

  function speechDetector() {
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
    /* global hark */
    return function(stream, options) {
      var opts = options || {};

      opts.play = false;
      var speechEvents = hark(stream, opts);

      stream = null;

      return speechEvents;
    };
  }
})(angular);
