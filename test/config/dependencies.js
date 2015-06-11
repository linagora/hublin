'use strict';

module.exports.testDependencies = function() {
  return [
    'frontend/components/chai/chai.js'
  ];
};

module.exports.externalDependencies = function() {
  return [
    'frontend/components/jquery/dist/jquery.min.js',
    'frontend/components/underscore/underscore.js',
    'frontend/components/bootstrap/dist/js/bootstrap.min.js',
    'frontend/components/pines-notify/pnotify.core.js',
    'frontend/components/pines-notify/pnotify.buttons.js',
    'frontend/components/pines-notify/pnotify.callbacks.js',
    'frontend/components/pines-notify/pnotify.confirm.js',
    'frontend/components/pines-notify/pnotify.desktop.js',
    'frontend/components/pines-notify/pnotify.history.js',
    'frontend/components/pines-notify/pnotify.nonblock.js',
    'frontend/components/URIjs/src/URI.min.js',
    'frontend/components/angular/angular.min.js',
    'frontend/components/angular-route/angular-route.min.js',
    'frontend/components/angular-mocks/angular-mocks.js',
    'frontend/components/angular-cookies/angular-cookies.min.js',
    'frontend/components/angular-animate/angular-animate.min.js',
    'frontend/components/angular-sanitize/angular-sanitize.min.js',
    'frontend/components/restangular/dist/restangular.min.js',
    'frontend/components/angular-strap/dist/angular-strap.min.js',
    'frontend/components/angular-strap/dist/angular-strap.tpl.min.js',
    'frontend/components/angular-moment/angular-moment.min.js',
    'frontend/components/angular-pines-notify/src/pnotify.js',
    'frontend/components/angular-social/src/scripts/00-directive.js',
    'frontend/components/angular-social/src/scripts/02-facebook.js',
    'frontend/components/angular-social/src/scripts/03-twitter.js',
    'frontend/components/angular-social/src/scripts/04-google-plus.js',
    'frontend/components/angular-social/src/scripts/09-github.js',
    'frontend/components/angular-social/src/scripts/12-linkedin.js',
    'frontend/components/matchmedia/matchMedia.js',
    'frontend/components/matchmedia-ng/matchmedia-ng.js',
    'frontend/components/angular-uuid4/angular-uuid4.min.js',
    'node_modules/easyrtc/api/easyrtc.js',
    'frontend/components/chai/chai.js',
    'frontend/components/chai-spies/chai-spies.js'
  ];
};

module.exports.applicationDependencies = function() {
  return [

    'frontend/components/opangular/src/easyrtc.js',
    'frontend/components/opangular/src/easyrtc/services.js',

    'frontend/components/opangular/src/socketio.js',
    'frontend/components/opangular/src/socketio/services.js',

    'frontend/js/modules/utils/wizard.js',
    'frontend/js/modules/configuration/configuration.js',

    'frontend/js/modules/authentication/authentication.js',

    'frontend/js/modules/user/user.js',
    'frontend/components/opangular/src/notification.js',
    'frontend/components/opangular/src/notification/services.js',

    'frontend/js/modules/websocket/websocket.js',
    'frontend/components/opangular/src/websocket/services.js',

    'frontend/js/modules/live-conference/live-conference.js',
    'frontend/js/modules/live-conference-devmode/live-conference-devmode.js',
    'frontend/components/angular-liveconference/dist/live-conference.all.js',

    'frontend/js/modules/utils/uri.js',
    'frontend/js/modules/utils/language.js',
    'frontend/js/modules/session/session.js',
    'frontend/js/modules/invitation/invitation.js',
    'frontend/js/modules/invitation/email.js',
    'frontend/js/modules/report/report.js',
    'frontend/js/modules/conference/conference.js',
    'frontend/js/modules/i18n/i18n.js',
    'frontend/js/live-conference/app.js'
  ];
};
