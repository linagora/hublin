'use strict';

var MAX_CONFERENCE_NAME_LENGTH = require('../../constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../constants').MIN_CONFERENCE_NAME_LENGTH;

var forbiddenIds = [
  'api',
  'views',
  'favicon.ico'
];

function isIdForbidden(id) {
  return forbiddenIds.indexOf(id) >= 0;
}

function isIdTooLong(id) {
  return id.length > MAX_CONFERENCE_NAME_LENGTH;
}

function isIdTooShort(id) {
  return id.length < MIN_CONFERENCE_NAME_LENGTH;
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

/**
 * Checks if the conference id is too long
 * @type {isIdTooLong}
 */
module.exports.isIdTooLong = isIdTooLong;

/**
 * Checks if the conference id is too short
 * @type {isIdTooShort}
 */
module.exports.isIdTooShort = isIdTooShort;
