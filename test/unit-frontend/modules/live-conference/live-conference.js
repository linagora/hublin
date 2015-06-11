'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The op.live-conference module', function() {

  beforeEach(function() {
    module('op.live-conference');
    module('meetings.jade.templates');
  });

  describe('The liveConferenceAutoReconnect directive', function() {
    var $timeout;

    beforeEach(function() {
      var easyRTCService = this.easyRTCService = {
        _disconnectCallbacks: [],

        connect: function(conf, cb) { cb(null); },
        leaveRoom: function(conf) {},
        performCall: function(id) {},
        addDisconnectCallback: function(cb) { this._disconnectCallbacks.push(cb); }
      };

      angular.mock.module(function($provide) {
        $provide.value('easyRTCService', easyRTCService);
        $provide.constant('MAX_RECONNECT_TIMEOUT', 6000);
      });
    });

    beforeEach(inject(function($rootScope, $window, _$timeout_, $compile) {
      $window.easyrtc = {
        enableDataChannels: function() {},
        setDisconnectListener: function() {},
        setDataChannelCloseListener: function() {},
        setCallCancelled: function() {},
        setOnStreamClosed: function() {}
      };
      this.scope = $rootScope.$new();
      $timeout = _$timeout_;

      $compile('<div live-conference live-conference-auto-reconnect></div>')(this.scope);
      $rootScope.$digest();
    }));

    it('should fail if the liveConference directive is not on the same element', function(done) {
      try {
        inject(function($rootScope, $compile) {
          this.scope = $rootScope.$new();
          $compile('<div live-conference-auto-reconnect></div>')(this.scope);
          $rootScope.$digest();
        });
      } catch (e) {
        return done();
      }
      return done(new Error('I should have thrown'));
    });

    it('should attempt to reconnect after being disconnected', function() {
      this.easyRTCService.connect = function(conf, callback) {
        connected++;
        callback(cberror);
      };

      var connected = 0;
      var cberror = new Error('still putting on makeup');

      expect(this.easyRTCService._disconnectCallbacks.length).to.equal(1);
      var disconnectCallback = this.easyRTCService._disconnectCallbacks[0];

      // Trigger disconnection
      disconnectCallback();

      // Do a few reconnection attempts
      $timeout.flush(1000);
      expect(connected).to.equal(1);
      $timeout.flush(2000);
      expect(connected).to.equal(2);
      $timeout.flush(4000);
      expect(connected).to.equal(3);

      // Max timeout reached, should limit the timeout value
      $timeout.flush(6000);
      expect(connected).to.equal(4);

      // Now succeed and verify there are no remaining timers
      cberror = null;
      $timeout.flush(6000);
      expect(connected).to.equal(5);
      $timeout.verifyNoPendingTasks();
    });
  });

  describe('The disconnect-dialog directive', function() {

    var $window;
    var element, scope;

    beforeEach(inject(function($compile, $rootScope, _$window_) {
      $window = _$window_;
      scope = $rootScope.$new();
      element = $compile('<disconnect-dialog />')(scope);

      $rootScope.$digest();
    }));

    it('should reload the page when the button is clicked', function(done) {
      $window.location.reload = done;

      element.find('button').click();
    });

  });

  describe('The eventCallbackService', function() {

    var eventCallbackService, eventCallbackRegistry;

    beforeEach(inject(function(_eventCallbackService_, _eventCallbackRegistry_) {
      eventCallbackService = _eventCallbackService_;
      eventCallbackRegistry = _eventCallbackRegistry_;
    }));

    it('The on function should throw an Error if callback is not a function', function() {
      expect(function() {
        eventCallbackService.on('test', 'I am not a function');
      }).to.throw(Error);
    });

    it('The on function should register a new callback, when it is the first callback', function() {
      var callback = function() {};

      eventCallbackService.on('test', callback);
      expect(eventCallbackRegistry).to.deep.equal({
        'test': [callback]
      });
    });

    it('The on function should register a new callback, when it is not the first callback', function() {
      var existingCallback = function() {};
      var callback = function() {};

      eventCallbackRegistry.test = [existingCallback];
      eventCallbackService.on('test', callback);
      expect(eventCallbackRegistry).to.deep.equal({
        'test': [existingCallback, callback]
      });
    });

    it('The off function should unregister a callback, when it is not the only callback', function() {
      var existingCallback = function() {};
      var callback = function() {};

      eventCallbackRegistry.test = [existingCallback, callback];
      eventCallbackService.off('test', callback);
      expect(eventCallbackRegistry).to.deep.equal({
        'test': [existingCallback]
      });
    });

    it('The off function should unregister a callback, when it is the only callback', function() {
      var callback = function() {};

      eventCallbackRegistry.test = [callback];
      eventCallbackService.off('test', callback);
      expect(eventCallbackRegistry).to.deep.equal({
        'test': []
      });
    });

  });

  describe('The conferenceController controller', function() {

    var $controller, deviceDetector = {}, eventCallbackRegistry, readyThen, initThen, goodbyeThen;

    beforeEach(function() {
      angular.mock.module(function($provide) {
        $provide.value('session', {
          ready: {
            then: function(callback) { readyThen = callback; }
          },
          initialized: {
            then: function(callback) { initThen = callback; }
          },
          goodbye: {
            then: function(callback) { goodbyeThen = callback; }
          }
        });
        $provide.value('conference', {});
        $provide.value('deviceDetector', deviceDetector);
        $provide.constant('EVENTS', { beforeunload: 'testbeforeunload'});
      });
    });

    beforeEach(inject(function(_$controller_, _eventCallbackRegistry_) {
      $controller = _$controller_;
      eventCallbackRegistry = _eventCallbackRegistry_;
    }));

    it('should not register beforeunload event listener when running in Firefox', function(done) {
      deviceDetector.raw = {
        browser: {
          firefox: true
        }
      };
      eventCallbackRegistry.testbeforeunload = [function() {
        done('This test should not call the beforeunload callback.');
      }];

      $controller('conferenceController', { $scope: {} });
      initThen();
      angular.element(window).trigger('testbeforeunload');

      done();
    });

    it('should register beforeunload event listener when not running in Firefox', function(done) {
      deviceDetector.raw = {
        browser: {
          firefox: false
        }
      };
      eventCallbackRegistry.testbeforeunload = [done];

      $controller('conferenceController', { $scope: {} });
      initThen();
      angular.element(window).trigger('testbeforeunload');
    });

  });

  describe('The landingPageReminder directive', function() {
    var element, scope, remindersGenerator, reminders;
    var eventCallbackService, eventCallbackRegistry;


    beforeEach(inject(function(_eventCallbackService_, _eventCallbackRegistry_) {
      eventCallbackService = _eventCallbackService_;
      eventCallbackRegistry = _eventCallbackRegistry_;
    }));

    beforeEach(function() {
      remindersGenerator = [1, 2, 3];
      reminders = remindersGenerator.map(function(n) {
        return {
          message: 'callback ' + n,
          buttonMesage: 'callback button' + n,
          buttons: [
            {
              text: 'Button 1',
              callback: chai.spy()
            },
            {
              text: 'Button 2',
              callback: chai.spy()
            }
          ]
        };
      });
      reminders.forEach(function(reminder) {
        eventCallbackService.on('conferenceleft', function() {
          return reminder;
        });
      });
    });

    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope.$new();

      element = angular.element('<goodbye-page-reminders></goodbye-page-reminders>');
      $compile(element)(scope);

      scope.$digest();
    }));

    it('should add the right number of buttons', function() {
      expect(element.find('a').length).to.equal(remindersGenerator.length * 2);
    });

    it('the buttons generated should be clickable', function() {
      element.find('a').click();

      reminders.forEach(function(reminder) {
        reminder.buttons.forEach(function(button) {
          expect(button.callback).to.have.been.called.once;
        });
      });
    });
  });
});
