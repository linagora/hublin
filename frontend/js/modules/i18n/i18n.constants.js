(function() {
  'use strict';

  angular.module('hublin.i18n')
    .constant('HUB_I18N_DEFAULT_LOCALE', 'en')
    .constant('HUB_I18N_AVAILABLE_LANGUAGE', ['en', 'fr', 'vi', 'de', 'zh'])
    .constant('HUB_I18N_AVAILABLE_LANGUAGE_KEYS', {
      'en_*': 'en',
      'fr_*': 'fr',
      'vi_*': 'vi',
      'de_*': 'de',
      'zh_*': 'zh'
    })
    .constant('HUB_I18N_DATE_FORMAT', {
      en: 'yyyy/MM/dd',
      zh: 'yyyy/MM/dd',
      fr: 'dd/MM/yyyy',
      vi: 'dd/MM/yyyy',
      de: 'dd/MM/yyyy'
    })
    ;
})();
