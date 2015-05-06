'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.conference module', function() {

  beforeEach(function() {
    module('meetings.conference');
    module('meetings.jade.templates');
  });

  describe('The create-conference-form directive', function() {

    var element;

    beforeEach(inject(function($compile, $rootScope) {
      this.scope = $rootScope.$new();
      element = $compile('<conference-create-form />')(this.scope);
      $rootScope.$digest();

      // So that focus() and probably other user interaction events fire
      element.appendTo(document.body);
    }));

    it('should contain one form element', function() {
      expect(element.find('form').length).to.equal(1);
    });

    it('should contain one input:text element', function() {
      expect(element.find('input[type="text"]').length).to.equal(1);
    });

    it('should initialize the input content with a value', function() {
      expect(element.find('input[type="text"]').val()).to.not.be.empty;
    });

    it('should select all text in the input when focused', function() {
      var input = element.find('input[type="text"]');

      input.focus();

      expect(input[0].selectionStart).to.equal(0);
      expect(input[0].selectionEnd).to.equal(input.val().length);
    });

    describe('the escapeRoomName function', function() {

      it('should return the same room name if no forbidden characters', function() {
        expect(this.scope.escapeRoomName('pipo')).to.equal('pipo');
      });

      it('should remove the forbidden characters from the room name', function() {
        var forbiddenChars = [',', '/', '?', ':', '@', '&', '=', '+', '$', '#', '<', '>', '[', ']',
        '{', '}', '"', '%', ';', '\\', '^', '|', '~' , '\'', '`'];
        var self = this;
        forbiddenChars.forEach(function(char) {
          var roomNameWithChar = 'test' + char + '  test';
          expect(self.scope.escapeRoomName(roomNameWithChar)).to.equal('testtest');

          var roomNameWithSameCharMultiple = char + 'test' + char + '  test  ' + char;
          expect(self.scope.escapeRoomName(roomNameWithSameCharMultiple)).to.equal('testtest');

          forbiddenChars.forEach(function(otherChar) {
            var roomNameWithDifferentChars = 'test' + otherChar + char + 'test';
            expect(self.scope.escapeRoomName(roomNameWithDifferentChars)).to.equal('testtest');
          });
        });

        expect(this.scope.escapeRoomName(forbiddenChars.join(''))).to.equal('');
      });

      it('should return nothing if the room name is a word form the blacklist', function() {
        var blackList = [
          'api',
          'components',
          'views',
          'js',
          'css',
          'images',
          'favicon.ico',
          'robots.txt',
          'apple-touch-icon.png',
          'apple-touch-icon-precomposed.png'
        ];
        var self = this;
        blackList.forEach(function(word) {
          expect(self.scope.escapeRoomName(word)).to.equal('');
        });
      });
    });

  });

  describe('The browserAuthorizationDialog directive', function() {
    var element, rootScope, gotMediaCB;
    beforeEach(function() {
      var easyRTCService = {
        setGotMedia: function(cb) {
          gotMediaCB = cb;
        }
      };
      module(function($provide) {
        $provide.value('easyRTCService', easyRTCService);
      });
    });

    beforeEach(inject(function($compile, $rootScope, $window) {
      element = $compile('<browser-authorization-dialog />')($rootScope);
      $rootScope.$digest();
      rootScope = $rootScope;
    }));

    it('should override easyRTCService.setGotMedia with a function broadcasting localMediaReady event', function(done) {
      expect(gotMediaCB).to.be.a.function;
      rootScope.$on('localMediaReady', function() {
        done();
      });
      gotMediaCB();
    });

  });

});
