'use strict';

var express = require('express');

module.exports = function(dependencies) {

  var router = express.Router(),
      controller = require('../controllers/i18n')(dependencies);

  router.get('/api/i18n/', controller.getCatalog);

  return router;

};
