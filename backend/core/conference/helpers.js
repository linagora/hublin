'use strict';

var forbiddenIds = [
  'api',
  'views',
  'favicon.ico'
];

function isIdForbidden(id) {
  return forbiddenIds.indexOf(id) >= 0;
}

/**
 * List of ids that are forbidden for conferences
 * @type {string[]}
 */
module.exports.forbiddenIds = forbiddenIds;

/**
 * Checks that a given conference id is not forbidden
 * @type {isIdForbidden}
 */
module.exports.isIdForbidden = isIdForbidden;
