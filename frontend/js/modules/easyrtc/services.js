/*global easyrtc */

'use strict';

angular.module('op.easyrtc')
  .factory('webrtcFactory', function() {
    function get() {
      return easyrtc;
    }

    return {
      get: get
    };
  }
);
