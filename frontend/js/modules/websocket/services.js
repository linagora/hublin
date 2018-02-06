'use strict';

angular.module('op.websocket')
  .factory('IoAction', ['$timeout', function($timeout) {
    function getNgCallback(callback) {
      return function() {
        var args = arguments;

        $timeout(function() {
          callback.apply(this, args);
        }, 0);
      };
    }

    function IoAction(options) {
      this.message = null;
      this.broadcast = null;
      this.namespace = null;
      this.subscription = null;
      this.removeListenerRequest = null;
      this.ngMessage = null;
      this.ngSubscription = null;
      options = options || {};

      [
        'message',
        'broadcast',
        'namespace',
        'subscription',
        'removeListenerRequest',
        'ngMessage',
        'ngSubscription'
      ].forEach(function(key) {
        if (key in options) {
          this[key] = options[key];
        }
      }.bind(this));
    }

    IoAction.prototype.isSubscription = function() {
      return !!this.subscription;
    };
    IoAction.prototype.isUnsubscribe = function() {
      return !!this.removeListenerRequest;
    };
    IoAction.prototype.equalsSubscription = function(other) {
      return (!this.namespace && !other.namespace || this.namespace === other.namespace) &&
        this.subscription[0] === other.subscription[0] &&
        this.subscription[1] === other.subscription[1];
    };

    IoAction.prototype.on = function(evt, cb) {
      this.subscription = [evt, cb];
      if (angular.isFunction(cb)) {
        this.ngSubscription = [evt, getNgCallback(cb)];
      } else {
        this.ngSubscription = [evt, cb];
      }
    };

    IoAction.prototype.emit = function() {
      this.message = Array.prototype.slice.call(arguments, 0);
      this.ngMessage = Array.prototype.slice.call(arguments, 0);
      var cb = this.message[(this.message.length - 1)];

      if (angular.isFunction(cb)) {
        this.ngMessage.pop();
        this.ngMessage.push(getNgCallback(cb));
      }
    };

    IoAction.prototype.of = function(namespaceName) {
      this.namespace = namespaceName;
    };

    IoAction.prototype.removeListener = function(name, listener) {
      this.subscription = [name, listener];
      this.removeListenerRequest = true;
    };

    IoAction.prototype.applyToSocketIO = function(ioSocketConnection, ioOfflineBuffer) {
      function _handleConnectedSubscription(s, action) {
        if (action.isUnsubscribe()) {
          action = ioOfflineBuffer.findSubscription(action);
          if (action) {
            s.removeListener.apply(s, action.ngSubscription);
          }
        } else {
          s.on.apply(s, action.ngSubscription);
        }
      }

      function _handleConnectedMessage(s, action) {
        s.emit.apply(s, action.ngMessage);
      }

      var s = ioSocketConnection.getSio(this.namespace);

      if (this.broadcast) {
        s = s.broadcast;
      }

      if (this.isSubscription()) {
        _handleConnectedSubscription(s, this);
      } else {
        _handleConnectedMessage(s, this);
      }
    };

    IoAction.prototype.toString = function() {
      var str = 'IoAction, namespace = ' + this.namespace + ' ';

      if (this.subscription) {
        if (this.isUnsubscribe()) {
          str += 'unsubscribe from ' + this.subscription[0] + ' ';
        } else {
          str += 'subscribe to ' + this.subscription[0] + ' ';
        }
      } else if (this.message) {
        str += 'message to ' + this.message[0];
      }

      return str;
    };

    return IoAction;
  }])
  .factory('ioInterface', ['IoAction', function(IoAction) {
    function ioInterface(callback) {

      var ioAction = new IoAction();
      var terminate = {
        emit: emit,
        of: of,
        on: on,
        removeListener: removeListener,
        broadcast: {
          emit: function() {
            ioAction.broadcast = true;

            return emit(arguments);
          }
        }
      };

      function buildCallbackResponse() {
        var completeAction = ioAction;

        ioAction = new IoAction();
        if (completeAction.namespace) {
          ioAction.of(completeAction.namespace);
        }

        return completeAction;
      }

      function emit() {
        ioAction.emit.apply(ioAction, arguments);
        callback(buildCallbackResponse());
      }

      function of(namespaceName) {
        ioAction.of(namespaceName);

        return terminate;
      }

      function on(evt, cb) {
        ioAction.on(evt, cb);
        callback(buildCallbackResponse());
      }

      function removeListener(evt, listener) {
        ioAction.removeListener(evt, listener);
        callback(buildCallbackResponse());
      }

      return terminate;
    }

    return ioInterface;
  }])
  .factory('ioOfflineBuffer', function() {
    var buffer = [];
    var subscriptions = [];

    function push(action) { buffer.push(action); }
    function getBuffer() { return buffer.slice(0); }
    function flushBuffer() { buffer = []; }
    function addSubscription(action) { subscriptions.push(action); }
    function getSubscriptions() { return subscriptions.slice(0); }

    function removeSubscription(action) {
      var index = findSubscriptionsIndex(action);

      while (index.length) {
        subscriptions.splice(index.pop(), 1);
      }
    }

    function handleSubscription(action) {
      return action.isUnsubscribe() ? removeSubscription(action) : addSubscription(action);
    }

    function findSubscriptionsIndex(action) {
      var index = [];

      subscriptions.forEach(function(sub, idx) {
        if (action.equalsSubscription(sub)) {
          index.push(idx);
        }
      });

      return index;
    }

    function findOneSubscription(action) {
      var subs = findSubscriptionsIndex(action);

      if (subs.length) {
        return subscriptions[subs[0]];
      }
    }

    return {
      push: push,
      handleSubscription: handleSubscription,
      findSubscription: findOneSubscription,
      getSubscriptions: getSubscriptions,
      getBuffer: getBuffer,
      flushBuffer: flushBuffer
    };
  })
  .factory('ioSocketConnection', ['$log', 'io', function($log, io) {
    var firstConnection = true;
    var connected = false;
    var sio = null;
    var disconnectCallbacks = [];
    var connectCallbacks = [];
    var reconnectCallbacks = [];
    var wsServerURI = '';

    function fireCallbacks(callbacks) {
      callbacks.forEach(function(callback) {
        try {
          callback();
        } catch (e) {
          $log.info('SocketIO disconnect callback error', e);
        }
      });
    }

    function bindListeners() {
      sio.on('error', function(reason) {
        $log.error('Unable to connect to websocket', reason);
      });
      sio.on('connect', function() {
        $log.info('WS Connection established with server', arguments);
        connected = true;
        fireCallbacks(connectCallbacks);
        if (!firstConnection) {
          fireCallbacks(reconnectCallbacks);
        } else {
          firstConnection = false;
        }
      });

      sio.on('connecting', function() {
        $log.info('Trying to connect to websocket');
      });

      sio.on('disconnect', function() {
        $log.info('Disconnected from websocket');
        connected = false;
        fireCallbacks(disconnectCallbacks);
      });
    }

    return {
      isConnected: function() {
        return connected;
      },
      setWSServerURI: function(uri) {
        wsServerURI = uri;
      },
      setSio: function(newSio) {
        sio = newSio;
        connected = false;
        bindListeners();
      },
      addDisconnectCallback: function(callback) {
        disconnectCallbacks.push(callback);
      },
      addConnectCallback: function(callback) {
        connectCallbacks.push(callback);
      },
      addReconnectCallback: function(callback) {
        reconnectCallbacks.push(callback);
      },
      getSio: function(namespace) {
        if (!namespace) {
          return sio;
        }
        if (!sio) {
          return null;
        }

        return io()(wsServerURI + namespace);
      }
    };
  }])
  .factory('ioSocketProxy', ['$log', 'ioSocketConnection', 'ioInterface', 'ioOfflineBuffer',
    function($log, ioSocketConnection, ioInterface, ioOfflineBuffer) {

      function _handleConnectedAction(action) {
        action.applyToSocketIO(ioSocketConnection, ioOfflineBuffer);
      }

      function _handleDisconnectedAction(action) {
        if (action.isSubscription()) { return; }
        ioOfflineBuffer.push(action);
      }

      function onSocketAction(action) {
        if (ioSocketConnection.isConnected()) {
          $log.info('connected, sending to socketio', action.toString());
          _handleConnectedAction(action);
        } else {
          $log.info('not connected, buffering', action.toString());
          _handleDisconnectedAction(action);
        }
        if (action.isSubscription()) {
          ioOfflineBuffer.handleSubscription(action);
        }
      }

      return function() {
        return ioInterface(onSocketAction);
      };
    }])
  .factory('ioConnectionManager', ['ioSocketConnection', 'tokenAPI', '$log', 'session', '$timeout', 'ioOfflineBuffer', 'io',
    function(ioSocketConnection, tokenAPI, $log, session, $timeout, ioOfflineBuffer, io) {

      function _disconnectOld() {
        var oldSio = ioSocketConnection.getSio();

        if (oldSio) { oldSio.disconnect(); }
      }

      function _connect(uri) {
        var wsServerURI = uri || '';

        tokenAPI.getNewToken().then(function(response) {
          _disconnectOld();

          var sio = io()(wsServerURI + '/', {
            query: 'token=' + response.data.token + '&user=' + session.user._id,
            reconnection: false
          });

          ioSocketConnection.setSio(sio);
          ioSocketConnection.setWSServerURI(wsServerURI);
        }, function(error) {
          $log.info('fatal: tokenAPI.getNewToken() failed');
          if (error && error.data) {
            $log.info('Error while getting auth token', error.data);
          }
        });
      }

      function _clearManagersCache() {
        var socketIO = io();

        Object.keys(socketIO.managers).forEach(function(k) {
          delete socketIO.managers[k];
        });
      }

      ioSocketConnection.addDisconnectCallback(function() {
        var reconnect = function() {
          $log.debug('ioConnectionManager reconnect algorithm starting');
          if (ioSocketConnection.isConnected()) { return; }
          _clearManagersCache();
          _connect();
          $timeout(reconnect, 1000);
        };

        reconnect();
      });

      ioSocketConnection.addConnectCallback(function() {
        var subscriptions = ioOfflineBuffer.getSubscriptions();
        var buffer = ioOfflineBuffer.getBuffer();

        ioOfflineBuffer.flushBuffer();
        $log.info('connect callback, ' + subscriptions.length + ' subscriptions, ' + buffer.length + ' buffered messages to apply');
        $log.debug(subscriptions);
        $log.debug(buffer);
        subscriptions.concat(buffer).forEach(function(action) { action.applyToSocketIO(ioSocketConnection, ioOfflineBuffer); });
      });

      return {
        connect: _connect
      };
    }])
  .factory('socket', ['$log', 'ioSocketProxy',
    function($log, ioSocketProxy) {
      return function(namespace) {
        var io = ioSocketProxy();

        if (namespace) {
          io.of(namespace);
        }

        return io;
      };
    }])
  .factory('socketIORoom', ['$log', function($log) {

    return function(namespace, room, client) {
      var subscriptions = {};
      var nbEventSubscribed = 0;

      function isCallbackRegistered(event, callback) {
        if (!subscriptions[event] || !subscriptions[event].callbacks) {
          return false;
        }

        return subscriptions[event].callbacks.some(function(element) {
          return element === callback;
        });
      }

      return {
        on: function(event, callback) {
          if (!room) {
            client.on(event, callback);
            $log.debug(namespace + ' : subscribed');

            return this;
          }

          function filterEvent(eventWrap) {
            if (eventWrap.room && eventWrap.room === room) {
              subscriptions[event].callbacks.forEach(function(element) {
                $log.debug('New', event, 'of namespace', namespace, 'in room', room, 'with data', eventWrap.data);
                element(eventWrap.data);
              });
            }
          }

          if (subscriptions[event]) {
            if (!isCallbackRegistered(event, callback)) {
              subscriptions[event].callbacks.push(callback);
            }
          } else {
            subscriptions[event] = {
              filterEvent: filterEvent,
              callbacks: [callback]
            };
            client.on(event, filterEvent);
            nbEventSubscribed++;
            if (nbEventSubscribed === 1) {
              this.subscribeToRoom();
            }
          }

          return this;
        },
        removeListener: function(event, callback) {
          if (!room) {
            client.removeListener(event, callback);
            $log.debug(namespace + ' : unsubscribed');

            return this;
          }
          if (!subscriptions[event]) {
            return this;
          }
          subscriptions[event].callbacks = subscriptions[event].callbacks.filter(function(element) {
            return element !== callback;
          });
          if (subscriptions[event].callbacks.length === 0) {
            client.removeListener(event, subscriptions[event].filterEvent);
            delete subscriptions[event];
            nbEventSubscribed--;
          }
          if (nbEventSubscribed === 0) {
            client.emit('unsubscribe', room);
            $log.debug(namespace + ' : unsubscribed to room', room);
          }
        },
        subscribeToRoom: function() {
          if (!room || !nbEventSubscribed) { return; }
          client.emit('subscribe', room);
          $log.debug(namespace + ' : subscribed to room', room);
        }
      };
    };
  }])
  .factory('livenotification', ['$log', 'socket', 'socketIORoom', 'ioSocketConnection',
    function($log, socket, socketIORoom, ioSocketConnection) {
      var socketCache = {};

      ioSocketConnection.addReconnectCallback(function() {
        Object.keys(socketCache).forEach(function(socketRoomId) {
          socketCache[socketRoomId].subscribeToRoom();
        });
      });

      /*
       * With room:
       * livenotification(namespace, room).on(event, callback);
       * livenotification(namespace, room).removeListener(event, callback);
       *
       * Without room:
       * livenotification(namespace).on(event, callback);
       * livenotification(namespace).removeListener(event, callback);
       */
      return function(namespace, room) {
        if (!socketCache[namespace + '/' + room]) {
          socketCache[namespace + '/' + room] = socketIORoom(namespace, room, socket(namespace));
        }

        return socketCache[namespace + '/' + room];
      };
    }]);
