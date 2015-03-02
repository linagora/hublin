'use strict';

var cookie = require('cookie');

function parseCookies(cookies) {
  return cookies.map(cookie.parse);
}
/**
 * Parse cookies
 *
 * @type {parseCookies}
 */
module.exports.parseCookies = parseCookies;

function getCookie(name, cookies) {
  var array = parseCookies(cookies);

  var found = array.map(function(element) {
    var keys = Object.keys(element);
    if (keys.indexOf(name) > -1) {
      return element[name];
    }
  });
  return found ? found[0] : null;
}
/**
 * Get a cookie from its name
 *
 * @type {getCookie}
 */
module.exports.getCookie = getCookie;
