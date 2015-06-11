'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var Meetings = new AwesomeModule('linagora.io.meetings', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.webserver', 'webserver'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.wsserver', 'wsserver'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.meetings.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.webrtc', 'webrtc'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.invitation', 'invitation'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.mailer', 'mailer'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.io.emailInvitation', 'emailInvitation')
  ],
  states: {
    lib: function(dependencies, callback) {
      var all = require('./webserver/routes/all')(dependencies),
          meetings = require('./webserver/routes/meetings')(dependencies),
          home = require('./webserver/routes/home')(dependencies),
          conferences = require('./webserver/routes/conferences')(dependencies),
          feedback = require('./webserver/routes/feedback')(dependencies),
          i18n = require('./webserver/routes/i18n')(dependencies),
          errors = require('./webserver/errors')(dependencies);

      return callback(null, {
        api: {
          meetings: meetings,
          all: all,
          conferences: conferences,
          home: home,
          feedback: feedback,
          i18n: i18n,
          errors: errors
        }
      });
    },

    deploy: function(dependencies, callback) {
      require('./core/pubsub').init(dependencies);

      var webserver = dependencies('webserver');

      webserver.application.use('/', this.api.all);
      webserver.application.use('/', this.api.conferences);
      webserver.application.use('/', this.api.meetings);
      webserver.application.use('/', this.api.home);
      webserver.application.use('/', this.api.feedback);
      webserver.application.use('/', this.api.i18n);

      webserver.application.use(this.api.errors.logErrors);
      webserver.application.use('/api/*', this.api.errors.apiErrorHandler);
      webserver.application.use(this.api.errors.clientErrorHandler);
      webserver.application.use(this.api.errors.errorHandler);

      return callback();
    },

    start: function(dependencies, callback) {
      return callback();
    }
  }
});

/**
 * This is the main AwesomeModule of the Meetings application
 * @type {AwesomeModule}
 */
module.exports.Meetings = Meetings;
