'use strict';

/**
 *
 * @param {object} dependencies
 * @return {{meetings: meetings, liveconference: liveconference}}
 */
module.exports = function(dependencies) {

  function meetings(req, res) {
    if (req.conference) {
      return res.render('live-conference/index', {id: req.conference._id});
    }
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
