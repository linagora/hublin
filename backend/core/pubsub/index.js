'use strict';

/**
 * @type {Pubsub|exports}
 */
module.exports.local = require('./local');

/**
 * @type {Pubsub|exports}
 */
module.exports.global = require('./global');

/**
 * Initialize all pubsub
 */
module.exports.init = function() {
};
