'use strict';

/* global chai: false */

var expect = chai.expect;

describe('Live Conference Directives', function() {

  beforeEach(function() {
    window.URI = function() {};
    module('op.live-conference');
    module('meetings.pug.templates');
  });

  describe('conferenceUserVideo', function() {

    var scope, conferenceState, $modal, matchmedia, callback;

    beforeEach(module(function($provide) {
      conferenceState = {
        getVideoElementById: function() {
          return 'video-thumb0';
        }
      };
      $modal = function() {
        return {
          $promise: {
            then: function() {
              callback();
            }
          }
        };
      };
      matchmedia = {
        isDesktop: function() {}
      };
      $provide.value('currentConferenceState', conferenceState);
      $provide.value('$modal', $modal);
      $provide.value('matchmedia', matchmedia);
      $provide.constant('LOCAL_VIDEO_ID', 'video0');
    }));

    beforeEach(inject(function($compile, $rootScope) {
      scope = $rootScope.$new();
      $compile('<conference-user-video/>')(scope);
      $rootScope.$digest();
    }));

    it('should not show modal if currentConferenceState.localVideoId === LOCAL_VIDEO_ID', function() {
      callback = function() {
        throw new Error('should not be here');
      };
      conferenceState.localVideoId = 'video0';
      scope.$digest();
      scope.onMobileToggleControls();
    });

    it('should show modal if currentConferenceState.localVideoId !== LOCAL_VIDEO_ID', function(done) {
      callback = done;
      conferenceState.localVideoId = 'video1';
      scope.$digest();
      scope.onMobileToggleControls();
    });

    it('should change attendee.mute when mute', function() {
      var attendee = {};
      var localVideoId = 'video1';
      var mainVideo = [{muted: false}];

      conferenceState.getAttendeeByVideoId = function() {
        return attendee;
      };
      conferenceState.getVideoElementById = function() {
        return mainVideo;
      };

      scope.$emit('localVideoId:ready', localVideoId);
      scope.$digest();
      scope.mute();
      expect(attendee.mute).to.deep.equal(true);
    });

    it('should set scope.isMe to false if video stream is not from current user video', function() {
      var localVideoId = 'video1';

      scope.$emit('localVideoId:ready', localVideoId);
      scope.$digest();

      expect(scope.isMe).to.be.false;
    });

    it('should set scope.isMe to true if video stream is from current user video', function() {
      var localVideoId = 'video0';

      scope.$emit('localVideoId:ready', localVideoId);
      scope.$digest();

      expect(scope.isMe).to.be.true;
    });

    describe('The showReportPopup fn', function() {
      window.$ = function() {return [{}];};

      it('should hide modal when called', function(done) {
        callback = done();
        scope.$emit('localVideoId:ready', 1);
        scope.$digest();
        scope.showReportPopup();
      });

      it('should call scope.showReport when attendee is found', function(done) {
        var attendee = {id: 1};
        var localVideoId = 'video1';

        scope.showReport = function(attendee) {
          expect(attendee).to.deep.equal(attendee);
          done();
        };
        callback = function() {};
        conferenceState.getAttendeeByVideoId = function() {
          return attendee;
        };

        scope.$emit('localVideoId:ready', localVideoId);
        scope.$digest();
        scope.showReportPopup();
      });

      it('should not call scope.showReport when attendee is not found', function(done) {
        var localVideoId = 'video1';

        scope.showReport = function() {
          done(new Error());
        };
        callback = function() {};
        conferenceState.getAttendeeByVideoId = function() {
        };

        scope.$emit('localVideoId:ready', localVideoId);
        scope.$digest();
        scope.showReportPopup();
        done();
      });
    });
  });

  describe('conferenceMobileVideo directive', function() {

    var scope, drawVideo, $timeout;
    window.$ = function() {
      return [{
        getContext: function() {
        }}];
    };

    beforeEach(module(function($provide) {
      drawVideo = function() {
        return angular.noop;
      };
      $provide.value('session', {});
      $provide.value('webRTCService', {});
      $provide.value('currentConferenceState', {
        getVideoElementById: function() {
          return 'video-thumb0';
        },
        videoIds: ['video-thumb0'],
        attendees: [{}]
      });
      $provide.value('drawVideo', drawVideo);
    }));

    beforeEach(inject(function($compile, _$timeout_, $rootScope) {
      $timeout = _$timeout_;
      scope = $rootScope.$new();
      $compile('<conference-mobile-video/>')(scope);
      $rootScope.$digest();
      $timeout.flush();
    }));

    it('should drawVideo when init', function(done) {
      drawVideo = done();
      scope.$digest();
    });

    it('should redraw video when update', function(done) {
      scope.$emit('conferencestate:localVideoId:update');
      drawVideo = done();
      scope.$digest();
    });
  });

  describe('The smartFit directive', function() {

    var $rootScope, $compile, parentElement, smartFitElement;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    afterEach(function() {
      if (parentElement) {
        document.body.removeChild(parentElement);
      }
    });

    function canvas(width, height) {
      return '<div style="position: absolute;" smart-fit from="#parent" preserve="#preserved"><canvas width="' + width + '" height="' + height + '" style="width: 100%, height: 100%"></canvas></div>';
    }

    function compileAndAppendCanvas(width, height) {
      var element = $compile(canvas(width, height))($rootScope);
      $rootScope.$digest();

      smartFitElement = parentElement.appendChild(element[0]);
    }

    function appendParentDiv(width, height) {
      var div = document.createElement('div');

      div.id = 'parent';
      div.style.position = 'absolute';
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      parentElement = document.body.appendChild(div);
    }

    function appendPreservedElement(left, top, width, height) {
      var div = document.createElement('div');

      div.id = 'preserved';
      div.style.position = 'absolute';
      div.style.left = left + 'px';
      div.style.top = top + 'px';
      div.style.width = width + 'px';
      div.style.height = height + 'px';
      parentElement = document.body.appendChild(div);
    }

    function resizeParent() {
      angular.element('#parent').resize();
    }

    function expectContainerSize(width, height) {
      var container = angular.element('[smart-fit]');

      expect(container.width()).to.equal(Math.floor(width));
      expect(container.height()).to.equal(Math.floor(height));
    }

    it('should resize element when parent is resized, respecting the inner canvas aspect ratio', function() {
      appendParentDiv(1980, 1080);
      compileAndAppendCanvas(1280, 720);
      resizeParent();

      expectContainerSize(1920, 1080);
    });

    it('should resize element when localVideoId:ready is broadcast, respecting the inner canvas aspect ratio', function() {
      appendParentDiv(1980, 1080);
      compileAndAppendCanvas(1280, 720);
      $rootScope.$broadcast('localVideoId:ready');

      expectContainerSize(1920, 1080);
    });

    it('Video(480x640) Parent(768x1024) -> Fit height -> 768x1024', function() {
      appendParentDiv(768, 1024);
      compileAndAppendCanvas(480, 640);
      resizeParent();

      expectContainerSize(768, 1024);
    });

    it('Video(480x640) Parent(1024x768) -> Fit height -> 768x1024', function() {
      appendParentDiv(1024, 768);
      compileAndAppendCanvas(480, 640);
      resizeParent();

      expectContainerSize(576, 768);
    });

    it('Video(640x360) Parent(768x1024) -> Fit width -> 768x432', function() {
      appendParentDiv(768, 1024);
      compileAndAppendCanvas(640, 360);
      resizeParent();

      expectContainerSize(768, 432);
    });

    it('Video(640x360) Parent(1024x768) -> Fit width -> 1024x576', function() {
      appendParentDiv(1024, 768);
      compileAndAppendCanvas(640, 360);
      resizeParent();

      expectContainerSize(1024, 576);
    });

    it('Video(768x1024) Parent(480x640) -> Fit height -> 480x640', function() {
      appendParentDiv(480, 640);
      compileAndAppendCanvas(768, 1024);
      resizeParent();

      expectContainerSize(480, 640);
    });

    it('Video(768x1024) Parent(640x480) -> Fit height -> 360x480', function() {
      appendParentDiv(640, 480);
      compileAndAppendCanvas(768, 1024);
      resizeParent();

      expectContainerSize(360, 480);
    });

    it('Video(1280x720) Parent(600x800) -> Fit width -> 600x337', function() {
      appendParentDiv(600, 800);
      compileAndAppendCanvas(1280, 720);
      resizeParent();

      expectContainerSize(600, 337);
    });

    it('Video(1280x720) Parent(800x600) -> Fit width -> 800x450', function() {
      appendParentDiv(800, 600);
      compileAndAppendCanvas(1280, 720);
      resizeParent();

      expectContainerSize(800, 450);
    });

    it('should center the element vertically, preserving the preserved element if present', function() {
      appendParentDiv(600, 800);
      appendPreservedElement(10, 600, 100, 100);
      compileAndAppendCanvas(1280, 720);
      resizeParent();

      // Computed video height: 337 (see test 'Video(1280x720) Parent(600x800)')
      // Preserved element is top=600
      // 600 - 337 / 2 -> 131.5
      expect(smartFitElement.style['margin-top']).to.equal('131.5px');
    });
  });

  describe('The conferenceVideo directive', function() {

    var $rootScope, $compile, $timeout, $window, hasVideo = false;
    var mainVideo = {
      0: {
        getContext: function() {
        }
      },
      on: function() {
        hasVideo = true;
      }
    };
    window.$ = function() {
      return mainVideo;
    };
    beforeEach(module(function($provide) {
      $provide.value('session', {});
      $provide.value('webRTCService', {
        isVideoEnabled: function() { return true; }
      });
      $provide.value('$modal', function() {});
      $provide.value('$state', {
        current: {
          data: {
            hasVideo: false
          }
        }
      });
      $provide.value('matchmedia', {
        isDesktop: function() { return true; }
      });
      $provide.value('currentConferenceState', {
        getVideoElementById: function() {
          return mainVideo;
        },
        videoIds: ['video-thumb0'],
        attendees: [{}]
      });
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$window_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      $window = _$window_;

      $window.requestAnimationFrame = function() {}; // PhantomJS doesn't have it...

      this.conferenceVideo = $compile('<conference-video />')($rootScope);
      $rootScope.$digest();
      $timeout.flush();
    }));

    it('should redraw the main video when orientation changes', function(done) {
      $rootScope.$on('localVideoId:ready', function() {
        done();
      });

      angular.element($window).trigger('orientationchange');
    });

    it('should resize the attendees bar when receiving attendeesBarSize', function() {
      $rootScope.$emit('attendeesBarSize', {width: 30});
      $rootScope.$apply();

      var attendeesBar = this.conferenceVideo.find('.conference-attendees-bar');
      expect(attendeesBar.css('width')).to.equal('70%');
    });

    it('should resize the attendees bar contents when receiving attendeesBarSize.marginRight', function() {
      $rootScope.$emit('attendeesBarSize', {marginRight: '30px'});
      $rootScope.$apply();

      var attendeesBar = this.conferenceVideo.find('.conference-attendees-bar > .content');
      expect(attendeesBar.css('marginRight')).to.equal('30px');
    });

    it('should change state data when video loaded', function() {
      expect(hasVideo).is.true;
    });
  });

  describe('The conferenceAttendeeVideo directive', function() {
    var $rootScope, $compile;
    var conferenceState, matchmedia;

    beforeEach(module(function($provide) {
      conferenceState = {
        getVideoElementById: function() {
          return 'video-thumb0';
        }
      };
      matchmedia = {
        isDesktop: function() {}
      };
      $provide.value('webRTCService', {
        isVideoEnabled: function() { return true; }
      });
      $provide.value('currentConferenceState', conferenceState);
      $provide.value('matchmedia', matchmedia);
      $provide.constant('LOCAL_VIDEO_ID', 'video0');
    }));

    beforeEach(function() {
      inject(function(_$rootScope_, _$compile_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
      });
    });

    function initDirective(scope, template) {
      scope = scope || $rootScope.$new();
      template = template || '<conference-attendee-video/>';
      var element = $compile(template)(scope);

      scope.$digest();

      return element;
    }

    it('should not add mirror class if video stream is not from current user video', function() {
      var template = '<conference-attendee-video video-id="video1"/>';
      var element = initDirective(null, template);

      expect(element.find('canvas.mirror')).to.have.length(0);
    });

    it('should add mirror class if video stream is from current user video', function() {
      var template = '<conference-attendee-video video-id="video0"/>';
      var element = initDirective(null, template);

      expect(element.find('canvas.mirror')).to.have.length(1);
    });
  });
});
