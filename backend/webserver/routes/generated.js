const express = require('express');

module.exports = dependencies => {
  const controller = require('../controllers/generated')(dependencies);
  const router = express.Router();

  router.get('/js/constants.js', controller.constants);

  return router;
};
