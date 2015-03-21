'use strict';

var expect = require('chai').expect,
    logger = require('../../../fixtures/logger-noop');

describe('The feedback controller', function() {
  var mailerMock = {};
  var dependencies = {
    'logger': logger(),
    'mailer': mailerMock
  };
  var deps = function(name) {
    return dependencies[name];
  };

  var errors, controller;

  before(function() {
    errors = this.helpers.requireBackend('webserver/errors')(deps);
    controller = this.helpers.requireBackend('webserver/controllers/feedback')(deps);
  });

  describe('The sendFeedbackMail function', function() {

    it('should not send any email if it cannot retrieve the configuration', function(done) {
      mailerMock.mailconfig = function(callback) {
        return callback(new Error('WTF'));
      };
      mailerMock.send = function() {
        done(new Error('This test should not call mailer.send !'));
      };

      this.helpers.expectHttpError(errors.ServerError, function(res) {
        controller.sendFeedbackMail(null, res);
      }, done);
    });

    it('should not send any email if the configuration does not contain a feedback object', function(done) {
      mailerMock.mailconfig = function(callback) {
        return callback(null, {});
      };
      mailerMock.send = function() {
        done(new Error('This test should not call mailer.send !'));
      };

      this.helpers.expectHttpError(errors.ServerError, function(res) {
        controller.sendFeedbackMail(null, res);
      }, done);
    });

    it('should not send any email if the configuration does not contain a feedback.rcpt object', function(done) {
      mailerMock.mailconfig = function(callback) {
        return callback(null, {
          feedback: {}
        });
      };
      mailerMock.send = function() {
        done(new Error('This test should not call mailer.send !'));
      };

      this.helpers.expectHttpError(errors.ServerError, function(res) {
        controller.sendFeedbackMail(null, res);
      }, done);
    });

    it('should send an email and use the configuration', function(done) {
      mailerMock.mailconfig = function(callback) {
        return callback(null, {
          feedback: {
            rcpt: ['foo@bar.com']
          }
        });
      };
      mailerMock.send = function(from, to, subject, text, callback) {
        expect(from).to.equal('user@domain.com');
        expect(to).to.deep.equal(['foo@bar.com']);
        expect(subject).to.equal('Hubl.in | Feedback from user');
        expect(text).to.equal('text');

        callback(null, { ok: 'ok' });
      };

      controller.sendFeedbackMail({
        body: {
          name: 'user',
          email: 'user@domain.com',
          text: 'text'
        }
      }, this.helpers.httpStatusCodeValidatingJsonResponse(200, function(data) {
        expect(data).to.deep.equal({ ok: 'ok' });

        done();
      }));
    });
  });
});
