'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The hubI18nService service', function() {
  var hubI18nService, HubI18nString, storageService;

  beforeEach(function() {
    angular.mock.module('hublin.i18n');

    storageService = {};
    angular.mock.module(function($provide) {
      $provide.value('localStorageService', storageService);
    });
  });

  beforeEach(inject(function(_hubI18nService_, _HubI18nString_) {
    hubI18nService = _hubI18nService_;
    HubI18nString = _HubI18nString_;
  }));

  describe('The translate function', function() {
    it('should create a HubI18nString instance', function() {
      var result = hubI18nService.translate('Foo Bar');

      expect(result).to.be.an.instanceof(HubI18nString);
    });

    it('should create a HubI18nString instance with multiple params', function() {
      var result = hubI18nService.translate('Foo', 'Bar', 'Feng');

      expect(result).to.have.property('text', 'Foo');
      expect(result.params).to.deep.equal(['Bar', 'Feng']);
    });

    it('should return the object if input text is an instantce of HubI18nString', function() {
      var translated = new HubI18nString('Foo Bar');
      var output = hubI18nService.translate(translated);

      expect(output).to.equal(translated);
    });

    it('should returnt an error if input object is neither string or HubI18nString', function() {
      function test() {
        hubI18nService.translate({text: 'Invalid Obj'});
      }

      expect(test).to.throw(TypeError);
    });
  });

  describe('The ishublinHubI18nString function', function() {
    it('should return true if text is HubI18nString', function() {
      var string = new HubI18nString('i18n string');

      expect(hubI18nService.isI18nString(string)).to.be.true;
    });

    it('should return false if text is not HubI18nString', function() {
      var string = 'normal string';

      expect(hubI18nService.isI18nString(string)).to.be.false;
    });
  });
});
