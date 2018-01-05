'use strict';

angular.module('op.notification')
  .factory('notificationFactory', ['notificationService', function(notificationService) {
    var stack_bottomright = {'dir1': 'up', 'dir2': 'left', 'push': 'top'};
    var stack_topright = {'dir1': 'down', 'dir2': 'left', 'push': 'top'};

    function weakOf(stack_placement, title, text, type) {
      return {
        title: title,
        text: text,
        nonblock: {
          nonblock: true,
          nonblock_opacity: 0.2
        },
        addclass: 'stack-bottomright',
        stack: stack_placement,
        type: type,
        delay: 3000,
        styling: 'fontawesome'
      };
    }

    function weakInfo(title, text) {
      notificationService.notify(weakOf(stack_bottomright, title, text, 'info'));
    }

    function weakSuccess(title, text) {
      notificationService.notify(weakOf(stack_bottomright, title, text, 'success'));
    }

    function weakError(title, text) {
      notificationService.notify(weakOf(stack_bottomright, title, text, 'error'));
    }

    function strongInfo(title, text) {
      notificationService.notify({
        title: title,
        text: text,
        addclass: 'stack_topright',
        stack: stack_topright,
        hide: false,
        styling: 'fontawesome'
      });
    }

    /**
     * Play a notification sound dynamically, caching the loaded sound.
     *
     * @param {String} url      The url of the sound to play
     */
    function playSound(url) {
      var sound = soundCache[url];
      if (!sound) {
        sound = soundCache[url] = new Audio();
        sound.autoplay = true;
        sound.src = url;
      } else if (sound.readyState > 2) {
        sound.play();
      }
      return sound;
    }

    /** The cache for the playSound function */
    var soundCache = {};

    /**
     * Notification with confirm/cancel dialog
     *
     * @param {string} title The notification title
     * @param {string} text The notification text
     * @param {string} The font-awesome icon name
     * @param {Array} An array of two elements with the names of the accept and cancel buttons
     * @param {object} data The parameter for `handlerConfirm` and `handlerCancel`
     * @param {function} handlerConfirm fn like handlerConfirm(data)
     * @param {function} handlerCancel fn like handlerCancel(data)
     */
    function confirm(title, text, icon, buttons, data, handlerConfirm, handlerCancel) {
      if (! handlerCancel) {
        handlerCancel = function() {};
      }

      var stack_topright = {'dir1': 'down', 'dir2': 'left', 'push': 'top'};
      icon = icon || 'fa-info';
      buttons = buttons || ['OK', 'Cancel'];

      (notificationService.notify({
        title: title,
        text: text,
        icon: 'fa ' + icon + ' fa-2 faa-ring animated',
        addclass: 'stack-topright',
        stack: stack_topright,
        hide: false,
        confirm: {
          confirm: true,
          buttons: [
            {
              text: buttons[0] || 'OK'
            },
            {
              text: buttons[1] || 'Cancel'
            }
          ]
        },
        buttons: {
          sticker: false
        },
        styling: 'fontawesome'
      })).get().on('pnotify.confirm', function() {
          handlerConfirm(data);
        }
      ).on('pnotify.cancel', function() {
          handlerCancel(data);
        });
    }
    return {
      weakInfo: weakInfo,
      weakError: weakError,
      weakSuccess: weakSuccess,
      strongInfo: strongInfo,
      confirm: confirm,
      playSound: playSound
    };
  }]);
