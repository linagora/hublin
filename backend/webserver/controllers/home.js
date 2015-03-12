'use strict';

/**
 *
 * @param {object} dependencies
 * @return {{meetings: meetings, liveconference: liveconference}}
 */
module.exports = function(dependencies) {

  function meetings(req, res) {
    if (req.conference) {
      return res.redirect('/' + req.conference._id);
    }
    return res.render('meetings/index');
  }

  function liveconference(req, res) {
    return res.render('live-conference/index', {id: req.params.id});
  }

  function embedButton(req, res) {
    return res.render('meetings/embed', {name: req.query.name || ''});
  }

  return {
    meetings: meetings,
    liveconference: liveconference,
    embedButton: embedButton
  };
};
