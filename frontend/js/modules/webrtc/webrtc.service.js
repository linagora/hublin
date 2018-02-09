(function(angular) {

  'use strict';

  angular.module('op.live-conference')
    .factory('webRTCService', webRTCService);

  function webRTCService($log, webRTCAdapterRegistry, WEBRTC_CONNECTOR) {
    var adapter = webRTCAdapterRegistry.get(WEBRTC_CONNECTOR);

    if (!adapter) {
      $log.warn(WEBRTC_CONNECTOR, 'webrtc connector has not been found, things will not work as expected');
    }

    return {
      leaveRoom: adapter.leaveRoom,
      performCall: adapter.performCall,
      connect: adapter.connect,
      canEnumerateDevices: adapter.canEnumerateDevices,
      enableMicrophone: adapter.enableMicrophone,
      muteRemoteMicrophone: adapter.muteRemoteMicrophone,
      enableCamera: adapter.enableCamera,
      enableVideo: adapter.enableVideo,
      isVideoEnabled: adapter.isVideoEnabled,
      configureBandwidth: adapter.configureBandwidth,
      setPeerListener: adapter.setPeerListener,
      myRtcid: adapter.myRtcid,
      broadcastData: adapter.broadcastData,
      broadcastMe: adapter.broadcastMe,
      addDisconnectCallback: adapter.addDisconnectCallback,
      removeDisconnectCallback: adapter.removeDisconnectCallback,
      sendDataP2P: adapter.sendDataP2P,
      sendDataWS: adapter.sendDataWS,
      sendData: adapter.sendData,
      getP2PConnectionStatus: adapter.getP2PConnectionStatus,
      doesDataChannelWork: adapter.doesDataChannelWork,
      setGotMedia: adapter.setGotMedia,
      NOT_CONNECTED: adapter.NOT_CONNECTED,
      BECOMING_CONNECTED: adapter.BECOMING_CONNECTED,
      IS_CONNECTED: adapter.IS_CONNECTED,
      addDataChannelOpenListener: adapter.addDataChannelOpenListener,
      addDataChannelCloseListener: adapter.addDataChannelCloseListener,
      removeDataChannelOpenListener: adapter.removeDataChannelOpenListener,
      removeDataChannelCloseListener: adapter.removeDataChannelCloseListener,
      addPeerListener: adapter.addPeerListener,
      removePeerListener: adapter.removePeerListener,
      connection: adapter.connection,
      getOpenedDataChannels: adapter.getOpenedDataChannels
    };
  }
})(angular);

