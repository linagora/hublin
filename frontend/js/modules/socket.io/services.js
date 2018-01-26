/* global io */

'use strict';

angular.module('op.socketio')
  .factory('io', function() {
    return function() {
      return io;
    };
  });
