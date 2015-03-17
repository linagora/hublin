'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.conference module', function() {

  beforeEach(function() {
    window.URI = function() {};

    module('meetings.conference');
    module('meetings.jade.templates');
  });

  describe('The create-conference-form directive', function() {

    var element;

    beforeEach(inject(function($compile, $rootScope) {
      element = $compile('<conference-create-form />')($rootScope);
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

  });

});
