(function() {
  'use strict';

  angular.module('hublin.i18n')
    .factory('HubI18nString', hubI18nStringFactory);

    function hubI18nStringFactory($translate) {
      function HubI18nString(text, params) {
        this.text = text;
        this.params = params;

        return this;
      }

      HubI18nString.prototype.toString = function() {
        if (!this.translated) {
          this.translated = $translate.instant(this.text, this.params);
        }

        return this.translated;
      };

      return HubI18nString;
    }
})();
