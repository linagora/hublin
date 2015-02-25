'use strict';

/**
 *
 * @param {hash} dependencies
 * @return {{index: index, app: app}}
 */
module.exports = function(dependencies) {

  function meetings(req, res) {
    return res.render('meetings/index');
  }

  function liveconference(req, res) {
    return res.render('live-conference/index', {id: req.params.id});
  }

  return {
    meetings: meetings,
    liveconference: liveconference
  };
};
