'use strict';

/**
 *
 * @param {hash} dependencies
 * @return {{index: index, app: app}}
 */
module.exports = function(dependencies) {

  function index(req, res) {
    return res.render('meetings/index');
  }

  function app(req, res) {
    return res.render('live-conference/index');
  }

  return {
    index: index,
    app: app
  };
};
