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
 * @param {dependencies} dependencies
 */
module.exports.init = function(dependencies) {
  require('../conference/pubsub').init(dependencies);
};
