'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The HubI18nString service', function() {
  var HubI18nString, $translate;

  beforeEach(function() {
    angular.mock.module('hublin.i18n');

    angular.mock.inject(function(_HubI18nString_, _$translate_) {
      HubI18nString = _HubI18nString_;
      $translate = _$translate_;
    });

    sinon.spy($translate, 'instant');
  });

  describe('The toString function', function() {
    it('should translate the text', function() {
      var translation = new HubI18nString('foo bar');

      translation.toString();

      expect($translate.instant).to.be.calledWith('foo bar');
    });

    it('should translate the text with multiple params', function() {
      var translation = new HubI18nString('foo %s %s', ['bar', 'bazz']);

      translation.toString();

      expect($translate.instant).to.be.calledWith('foo %s %s', ['bar', 'bazz']);
    });

    it('should not translate again if the text has been already translated', function() {
      var translation = new HubI18nString('foo bar');

      translation.toString();
      translation.toString();

      expect($translate.instant).have.been.calledOnce;
    });
  });
});
