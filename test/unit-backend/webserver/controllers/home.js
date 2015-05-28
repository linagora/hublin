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

    beforeEach(function() {
      mockery.registerMock('../errors', function() {});
    });

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

    it('should send back english TOS if there is a problem reading the localized file', function(done) {
      mockery.registerMock('marked', function(markdown) {
        return 'parsedTermsOfService';
      });
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          return /zh.md$/.test(file) ? callback(new Error('WTF')) : callback(null, 'tos');
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
              termsOfService: 'parsedTermsOfService'
            });

            done();
          }
        });
    });

  });

  describe('The embedButton function', function() {

    beforeEach(function() {
      mockery.registerMock('../errors', function() {
        return {
          ServerError: function() {}
        };
      });
    });

    it('should throw a ServerError if there is a problem reading the widget file', function(done) {
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(new Error('WTF'));
        }
      });

      try {
        this.helpers
          .requireBackend('webserver/controllers/home')(deps)
          .embedButton({}, {
            send: function() {
              done(new Error('This test should not call res.send'));
            }
          });
      } catch (e) {
        done();
      }
    });

    it('should send the Content-Type header to application/javascript', function(done) {
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(null, 'widget.js');
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .embedButton({}, {
          set: function(header, value) {
            expect(header).to.equal('Content-Type');
            expect(value).to.equal('application/javascript');
          },
          send: function(contents) {
            done();
          }
        });
    });

    it('should send the widget.js file contents', function(done) {
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(null, 'widget.js');
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .embedButton({}, {
          set: function() {},
          send: function(contents) {
            expect(contents).to.equal('widget.js');

            done();
          }
        });
    });

    it('should send the widget.js file contents, replacing i18n calls correctly using the default locale', function(done) {
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(null, 'widget.js containing a __(word to translate) a this location.');
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .embedButton({
          query: {},
          getLocale: function() { return 'defaultLocale'; },
          __: function(obj) {
            expect(obj).to.deep.equal({
              locale: 'defaultLocale',
              phrase: 'word to translate'
            });

            return 'translated word';
          }
        }, {
          set: function() {},
          send: function(contents) {
            expect(contents).to.equal('widget.js containing a translated word a this location.');

            done();
          }
        });
    });

    it('should send the widget.js file contents, replacing i18n calls correctly using overriden locale', function(done) {
      mockery.registerMock('fs', {
        readFile: function(file, options, callback) {
          callback(null, 'widget.js containing a __(word to translate) a this location.');
        }
      });

      this.helpers
        .requireBackend('webserver/controllers/home')(deps)
        .embedButton({
          query: {
            locale: 'fr'
          },
          getLocale: function() { return 'defaultLocale'; },
          __: function(obj) {
            expect(obj).to.deep.equal({
              locale: 'fr',
              phrase: 'word to translate'
            });

            return 'mot traduit';
          }
        }, {
          set: function() {},
          send: function(contents) {
            expect(contents).to.equal('widget.js containing a mot traduit a this location.');

            done();
          }
        });
    });

  });

});
