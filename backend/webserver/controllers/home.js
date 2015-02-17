'use strict';

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
