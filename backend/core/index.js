'use strict';

require('./env');
var fs = require('fs');
/**
 *
 */
exports = module.exports = {};

fs.readdirSync(__dirname).forEach(function(filename) {
  var stat = fs.statSync(__dirname + '/' + filename);
  if (!stat.isDirectory()) { return; }
  function load() { return require('./' + filename); }
  exports.__defineGetter__(filename, load);
});

/**
 * Initialize core component
 * @param {function} callback
 */
exports.init = function(callback) {
  exports.db.mongo.init();
  if (callback) {
    callback();
  }
};
