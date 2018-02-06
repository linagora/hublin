(function(angular) {
  'use strict';

  angular.module('meetings.invitation').provider('invitationService', function() {
    var $q;
    var contactLookups = {};

    function flattenLookups() {
      return Object.keys(contactLookups).sort().reduce(function(prv, cur) {
        return prv.concat(contactLookups[cur]);
      }, []);
    }

    var service = {
      /**
       * Returns the directive data for a contact directive. Use this by defining a
       * directive with the name invitationDialogUser<ObjectType>, for example
       * invitationDialogUserEmail and then returning the result of this call:
       *  mymodule.directive('invitationDialogUserEmail',
       *    ['invtiationService', function(invitationService) {
       *      var templateUrl = "...";
       *      return invitationService.createContactDirective(templateUrl);
       *    }]
       *  );
       */
      createContactDirective: function(templateUrl) {
        return {
          restrict: 'A',
          replace: true,
          scope: {
            contact: '=',
            remove: '&'
          },
          templateUrl: templateUrl
        };
      },

      /**
       * Lookup a contact by input text, calling the backend lookup services in
       * order of priority. The first service that returns a result will resolve
       * the promise.
       *
       * @param {String}      Text to look up
       * @return {Promise}    A promise resolved with the found contact
       */
      lookup: function(text) {
        function lookup(impls) {
          var impl = impls.shift();

          if (impl && impl.validate(text)) {
            // Make the lookup, either resolving with the result or recursively
            // trying the next service.
            return $q.when(impl.lookup(text)).then(function(res) {
              if (res) {
                return res;
              }

              return lookup(impls);
            });
          } else if (impl) {
            // Invalid, go to the next implementation
            return lookup(impls);
          }

          // Contact not found, resolve with null value
          return $q.when(null);
        }

        return lookup(flattenLookups());
      },

      /**
       * Get autocomplete results from all registered lookups. All autocomplete
       * lookups MUST do the best they can to resolve their autocomplete promise.
       * If there are no results or an error occurred, it should resolve with an
       * empty array. Positive results are an array of objects, each object being
       * a contact object, with at least a type and id.
       *
       * @param {String}      The autocomplete text to lookup.
       * @return {Promise}    A promise resolved with a flat array of
       *                        autocomplete results
       */
      autocomplete: function(input) {
        return $q.all(flattenLookups().map(function(impl) {
          return impl.autocomplete ? impl.autocomplete(input) : $q.when([]);
        })).then(function(results) {
          return results.reduce(function(prv, cur) {
            return prv.concat(cur || []);
          });
        });
      },

      /**
       * Check if the given input is valid for at least one of the registered
       * contact lookups.
       *
       * @param {String} input    The text input to check
       * @return {Boolean}        True, if the input is valid
       */
      validate: function(input) {
        return flattenLookups().some(function(impl) {
          return impl.validate(input);
        });
      }
    };

    /**
     * Register a contact lookup service. The service should have the following
     * methods:
     *  - lookup:         Resolves with a specific contact object
     *  - autocomplete:   Resolves with an array of autocomplete data for the
     *                      given input.
     *  - valdiate:       A synchronous check if the input text is in a valid
     *                      format for this implementation.
     * Example:
     *
     * register(100, {
     *   lookup: function(text) {
     *     var data = this.validate(text) ? { objectType: 'email', id: text } : null;
     *     return $q.when(data);
     *   },
     *   autocomplete: function(input) {
     *     return this.lookup(input).then(function(res) {
     *       return res ? [res] : [];
     *     });
     *   },
     *   validate: function(input) {
     *     return !!input.match(EMAIL_REGEX);
     *   }
     * });
     *
     * @param {Number} prio   The priority of the contact lookup
     * @param {Object} impl   The implementation, with the above methods
     */
    this.register = function(prio, impl) {
      if (!(prio in contactLookups)) {
        contactLookups[prio] = [];
      }
      contactLookups[prio].push(impl);
    };

    /**
     * Returns the service for this provider when invoked
     */
    this.$get = ['$q', function(_$q) {
      $q = _$q;

      return service;
    }];
  }).directive('invitationDialogSwitch', ['$compile', function($compile) {
    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      link: function(scope, element, attrs) {
        var objectType = scope.$eval(attrs.objectType);
        var snakeObjectType = objectType.replace(/[A-Z]/g, function(match) {
          return '-' + match.toLowerCase();
        });
        var dirName = 'invitation-dialog-user-' + snakeObjectType;

        element.attr(dirName, '');
        element.removeAttr('object-type');
        element.removeAttr('data-invitation-dialog-switch');

        $compile(element)(scope);
      }
    };
  }]).directive('invitationDialogValidate', ['invitationService', function(invitationService) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.unshift(function(value) {
          var valid = invitationService.validate(value);

          ngModel.$setValidity('invitations', valid);

          return valid ? value : undefined;
        });
        ngModel.$formatters.unshift(function(value) {
          var valid = invitationService.validate(value);

          ngModel.$setValidity('invitations', valid);

          return value;
        });
      }
    };
  }]);
})(angular);
