'use strict';

var dbModule = {
  mongo: require('./mongo'),
  redis: require('./redis')
};

/**
 * @type {{mongo: exports, redis: exports}}
 */
module.exports = dbModule;
