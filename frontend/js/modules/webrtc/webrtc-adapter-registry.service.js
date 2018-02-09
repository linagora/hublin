(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('webRTCAdapterRegistry', webRTCAdapterRegistry);

  function webRTCAdapterRegistry() {
    var adapters = {};

    return {
      register: register,
      get: get
    };

    function register(name, adapter) {
      adapters[name] = adapter;
    }

    function get(name) {
      return adapters[name];
    }
  }

})(angular);
