'use strict';

/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
(function() {

  var docElem = document.documentElement;
  var header = $('.navbar-default');
  var conferenceInput = $('.conference-input');
  var conferenceLi = $('.conference-li');
  var conferenceCreate = $('.conference-create');
  var didScroll = false;
  var changeHeaderOn = 60;

  function init() {
    window.addEventListener('scroll', function(event) {
      if (!didScroll) {
        didScroll = true;
        setTimeout(scrollPage, 60);
      }
    }, false);
    conferenceInput.focus();
  }

  function scrollPage() {
    var sy = scrollY();
    if (sy >= changeHeaderOn) {
      header.addClass('navbar-shrink');
      conferenceLi.removeClass('hidden');
      conferenceCreate.addClass('hidden');
    }
    else {
      header.removeClass('navbar-shrink');
      conferenceLi.addClass('hidden');
      conferenceCreate.removeClass('hidden');
    }
    didScroll = false;
  }

  function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
  }

  init();

})();
