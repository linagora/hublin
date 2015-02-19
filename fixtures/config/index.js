'use strict';

var fs = require('fs-extra');
var path = require('path');
var config = path.resolve(__dirname + '/../../config');

/**
 *
 * @param {function} done
 * @return {*}
 */
module.exports = function(done) {
  console.log('[INFO] Copy configuration files');
  var data = __dirname + '/data';
  fs.readdirSync(data).forEach(function(filename) {
    var from = data + '/' + filename;
    var to = config + '/' + filename;
    if (fs.statSync(from).isFile()) {
      console.log('[INFO] Copy ', from);
      fs.copySync(from, to);
    }
  });
  if (done) {
    return done();
  }
};

