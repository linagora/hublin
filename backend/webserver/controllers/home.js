'use strict';

/**
 *
 * @param {hash} dependencies
 * @return {{index: index, app: app}}
 */
module.exports = function(dependencies) {

  function index(req, res) {
    return res.render('index');
  }

  function app(req, res) {
    return res.render('application');
  }

  return {
    index: index,
    app: app
  };
};
