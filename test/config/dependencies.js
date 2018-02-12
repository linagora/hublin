'use strict';

module.exports.testDependencies = function() {
  return [
    'frontend/components/chai/chai.js'
  ];
};

module.exports.externalDependencies = function() {
  return [
    'frontend/components/jquery/dist/jquery.min.js',
    'frontend/components/lodash/dist/lodash.min.js',
    'frontend/components/bootstrap/dist/js/bootstrap.min.js',
    'frontend/components/URIjs/src/URI.min.js',
    'frontend/components/angular/angular.min.js',
    'frontend/components/angular-route/angular-route.min.js',
    'frontend/components/angular-material/angular-material.min.js',
    'frontend/components/angular-aria/angular-aria.min.js',
    'frontend/components/angular-messages/angular-messages.min.js',
    'frontend/components/angular-ui-router/release/angular-ui-router.js',
    'frontend/components/angular-mocks/angular-mocks.js',
    'frontend/components/angular-cookies/angular-cookies.min.js',
    'frontend/components/angular-animate/angular-animate.min.js',
    'frontend/components/angular-sanitize/angular-sanitize.min.js',
    'frontend/components/restangular/dist/restangular.min.js',
    'frontend/components/angular-strap/dist/angular-strap.min.js',
    'frontend/components/angular-strap/dist/angular-strap.tpl.min.js',
    'frontend/components/moment/min/moment.min.js',
    'frontend/components/moment-timezone/builds/moment-timezone-with-data.min.js',
    'frontend/components/angular-moment/angular-moment.min.js',
    'frontend/components/angular-social/src/scripts/00-directive.js',
    'frontend/components/angular-social/src/scripts/02-facebook.js',
    'frontend/components/angular-social/src/scripts/03-twitter.js',
    'frontend/components/angular-social/src/scripts/04-google-plus.js',
    'frontend/components/angular-social/src/scripts/09-github.js',
    'frontend/components/angular-social/src/scripts/12-linkedin.js',
    'frontend/components/matchmedia/matchMedia.js',
    'frontend/components/matchmedia-ng/matchmedia-ng.js',
    'frontend/components/angular-uuid4/angular-uuid4.min.js',
    'frontend/components/chai/chai.js',
    'frontend/components/chai-spies/chai-spies.js',
    'frontend/components/sinon-chai/lib/sinon-chai.js',
    'frontend/components/sinon-browser-only/sinon.js',
    'frontend/components/clipboard/dist/clipboard.min.js',
    'frontend/components/ngclipboard/dist/ngclipboard.min.js',
    'test/config/module-mocks.js'
  ];
};

module.exports.applicationDependencies = function() {
  return [
    'frontend/js/modules/socket.io/module.js',
    'frontend/js/modules/socket.io/services.js',

    'frontend/js/modules/utils/wizard.js',
    'frontend/js/modules/configuration/configuration.js',

    'frontend/js/modules/authentication/authentication.js',

    'frontend/js/modules/user/user.js',
    'frontend/js/modules/notification/module.js',
    'frontend/js/modules/notification/services.js',

    'frontend/js/modules/websocket/module.js',
    'frontend/js/modules/websocket/services.js',

    'frontend/js/modules/live-conference/module.js',
    'frontend/js/modules/live-conference/live-conference.js',
    'frontend/js/modules/live-conference/live-conference.directive.js',
    'frontend/js/modules/live-conference/modal-errors.service.js',
    'frontend/js/modules/live-conference-devmode/live-conference-devmode.js',

    'frontend/js/modules/clipboard/module.js',
    'frontend/js/modules/clipboard/**/*.js',

    'frontend/js/modules/attendee/**/*.js',
    'frontend/js/modules/utils/**/*.js',
    'frontend/js/modules/session/session.js',
    'frontend/js/modules/invitation/module.js',
    'frontend/js/modules/invitation/**/*.js',
    'frontend/js/modules/speak/module.js',
    'frontend/js/modules/speak/**/*.js',
    'frontend/js/modules/report/report.js',
    'frontend/js/modules/conference/module.js',
    'frontend/js/modules/conference/**/*.js',
    'frontend/js/modules/i18n/i18n.module.js',
    'frontend/js/modules/i18n/i18n.constants.js',
    'frontend/js/modules/i18n/i18n.filter.js',
    'frontend/js/modules/i18n/i18n.service.js',
    'frontend/js/modules/i18n/i18n-dateformat.service.js',
    'frontend/js/modules/i18n/i18n-interpolator.service.js',
    'frontend/js/modules/i18n/i18n-loader.service.js',
    'frontend/js/modules/i18n/i18n-string.service.js',
    'frontend/js/live-conference/constants.js',
    'frontend/js/live-conference/app.js'
  ];
};
