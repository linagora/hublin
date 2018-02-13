var angularInjections = angularInjections || []; //eslint-disable-line no-use-before-define

(function(angular) {
  'use strict';

  angular.module('liveConferenceApplication', [
    'ngMaterial',
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'op.socketio',
    'op.websocket',
    'op.live-conference',
    'op.lodash-wrapper',
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
    'hublin.speak',
    'hublin.i18n',
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

