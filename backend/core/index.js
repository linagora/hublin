'use strict';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}
var fs = require('fs');
exports = module.exports = {};

fs.readdirSync(__dirname).forEach(function(filename) {
  var stat = fs.statSync(__dirname + '/' + filename);
  if (!stat.isDirectory()) { return; }
  function load() { return require('./' + filename); }
  exports.__defineGetter__(filename, load);
});

exports.init = function(callback) {
  exports.db.mongo.init();
  exports.pubsub.init();
  if (callback) {
    callback();
  }
};
