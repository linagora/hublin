'use strict';

var express = require('express');
var FRONTEND_PATH = require('./constants').FRONTEND_PATH;

module.exports = function(dependencies) {

  var application = express();

  // This needs to be initialized before the body parser
  application.use(express.static(FRONTEND_PATH));

  return application;
};
