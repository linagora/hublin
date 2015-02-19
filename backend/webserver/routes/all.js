'use strict';

var express = require('express');
var cors = require('cors');

/**
 * This router is responsible of the conferences API
 * @param {function} dependencies
 * @return {Router}
 */
module.exports = function(dependencies) {

  var router = express.Router();

  router.all('/api/*', cors());

  return router;
};
