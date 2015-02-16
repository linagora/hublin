'use strict';

// We can define the config path from the NODE_CONFIG
// This may be useful for tests
// Note that it loks that konphyg does not handle undefined and null so we have to be it here this way
var config = process.env.NODE_CONFIG;
if (!config || config === undefined || config === 'undefined' || config === null || config === 'null') {
  config = __dirname + '/../../../config';
}

exports = module.exports = require('konphyg')(config);
