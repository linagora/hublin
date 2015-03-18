'use strict';

var expect = require('chai').expect,
    logger = require('../../../fixtures/logger-noop'),
    mockery = require('mockery');

describe('The home controller', function() {
  var dependencies = {
    'logger': logger()
  };
  var deps = function(name) {
    return dependencies[name];
  };

  describe('The meetings function', function() {

    it('should parse the terms of service with marked', function(done) {
      mockery.registerMock('marked', function() {
        return 'parsedTermsOfService';
      });
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(null, 'tos');
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .meetings({
          getLocale: function() {
            return 'en';
          }
        }, {
          render: function(template, model) {
            expect(model).to.deep.equal({
              termsOfService: 'parsedTermsOfService'
            });

            done();
          }
        });
    });

    it('should read the TOS file of the correct locale', function(done) {
      mockery.registerMock('marked', function(markdown) { return markdown; });
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          expect(file).to.match(/zh.md$/);

          done();
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .meetings({
          getLocale: function() {
            return 'zh';
          }
        }, {});
    });

    it('should send back empty TOS if there is a problem reading the file', function(done) {
      mockery.registerMock('marked', function(markdown) {
        done(new Error('This test should not call marked()'));
      });
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(new Error('WTF'));
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .meetings({
          getLocale: function() {
            return 'zh';
          }
        }, {
          render: function(template, model) {
            expect(model).to.deep.equal({
              termsOfService: ''
            });

            done();
          }
        });
    });

  });

});
