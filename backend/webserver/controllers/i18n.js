'use strict';

module.exports = function(dependencies) {

  var errors = require('../errors')(dependencies);

  function getCatalog(req, res) {
    var locale = req.query.locale || req.getLocale(),
        catalog = req.getCatalog(locale);

    if (!catalog) {
      throw new errors.NotFoundError('No catalog found for locale ' + locale);
    }

    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(200, catalog);
  }

  return {
    getCatalog: getCatalog
  };

};
