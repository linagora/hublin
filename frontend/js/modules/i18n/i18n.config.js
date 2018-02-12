(function() {
  'use strict';

  angular.module('hublin.i18n')
    .config(function($translateProvider, HUB_I18N_AVAILABLE_LANGUAGE, HUB_I18N_AVAILABLE_LANGUAGE_KEYS, HUB_I18N_DEFAULT_LOCALE) {
      $translateProvider.useLoader('hubI18nLoader');
      $translateProvider.preferredLanguage(HUB_I18N_DEFAULT_LOCALE);
      $translateProvider.determinePreferredLanguage(); //Try to guess language from window.navigator
      $translateProvider.fallbackLanguage(HUB_I18N_DEFAULT_LOCALE);
      $translateProvider.registerAvailableLanguageKeys(HUB_I18N_AVAILABLE_LANGUAGE, HUB_I18N_AVAILABLE_LANGUAGE_KEYS);
      $translateProvider.useInterpolation('hubI18nInterpolator');
      $translateProvider.useSanitizeValueStrategy('escape');
    });
})();
