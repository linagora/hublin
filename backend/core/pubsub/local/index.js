'use strict';

var Pubsub = require('../pubsub');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

var removeListener = emitter.removeListener;

/**
 *
 * @param {string} event
 * @param {function} handler
 * @this this
 */
emitter.removeListener = function(event, handler) {
  var count = this.listeners(event).length;
  var countAfterRemove = 0;
  while (count !== countAfterRemove) {
    count = countAfterRemove;
    removeListener.call(this, event, handler);
    countAfterRemove = this.listeners(event).length;
  }
};

var pubsub = new Pubsub(emitter);
/**
 * @type {Pubsub}
 */
module.exports = pubsub;
