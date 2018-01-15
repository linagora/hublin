var angularInjections = angularInjections || [];

(function(angular) {
  'use strict';

  angular.module('liveConferenceApplication', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'op.socketio',
    'op.websocket',
    'op.live-conference',
    'op.notification',
    'op.localstorage',
    'op.dynamicDirective',
    'meetings.authentication',
    'meetings.session',
    'meetings.user',
    'meetings.conference',
    'meetings.conference.constants',
    'meetings.configuration',
    'meetings.language',
    'meetings.i18n',
    'restangular',
    'uuid4',
    'mgcrea.ngStrap',
    'ngSocial',
    'matchmedia-ng',
    'op.live-conference-devmode',
    'ng.deviceDetector',
    'angularMoment',
    'ui.router'
  ].concat(angularInjections));
})(angular);

