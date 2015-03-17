'use strict';

angular.module('meetings.language', [])
.directive('automaticOrientation', function() {
  return {
    restrict: 'AC',
    link: function(scope, element, attrs) {

      function hasArabicChars() {
        var arabic = /[\u0600-\u06FF]/;
        return element.val().match(arabic);
      }

      element.keyup(function() {
        if (hasArabicChars()) {
          element.css('direction', 'rtl');
        }
        else {
          element.css('direction', 'ltr');
        }
      });
    }
  };
});
