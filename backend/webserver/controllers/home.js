'use strict';

var marked = require('marked'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');

/**
 *
 * @param {object} dependencies
 * @return {{meetings: meetings, liveconference: liveconference}}
 */
module.exports = function(dependencies) {

  var logger = dependencies('logger'),
      errors = require('../errors')(dependencies);

  function tosFile(locale) {
    return path.normalize(path.join(__dirname, '../../i18n/tos/' + locale + '.md'));
  }

  function meetings(req, res) {
    if (req.conference) {
      return res.redirect('/' + req.conference._id);
    }

    Q.nfcall(fs.readFile, tosFile(req.getLocale()), {encoding: 'utf-8'})
      .then(null, function(err) {
        logger.warn('Could not read terms of service from the filesystem using locale %s. Falling back to english version.', req.getLocale(), err);

        return Q.nfcall(fs.readFile, tosFile('en'), {encoding: 'utf-8'});
      })
      .then(function(contents) {
        res.render('meetings/index', {
          termsOfService: contents ? marked(contents) : ''
        });
      });
  }

  function liveconference(req, res) {
    return res.render('live-conference/index', {id: req.params.id});
  }

  function embedButton(req, res) {
    var widgetJs = path.normalize(path.join(__dirname, '../../../frontend/views/meetings/widget.js'));

    fs.readFile(widgetJs, {encoding: 'utf-8'}, function(err, contents) {
      if (err) {
        throw new errors.ServerError('Cannot read widget.js file. ', err);
      }

      res.set('Content-Type', 'application/javascript');

      // Send the Javascript file contents, dynamically replacing __(string-to-localize)
      // with the localized version of string-to-localize.
      // The format was chosen after the __ function used by the i18n library
      res.send(contents.replace(/__\((.*)\)/g, function(match, group) {
        return req.__({
          locale: req.query.locale || req.getLocale(),
          phrase: group
        });
      }));
    });
  }

  return {
    meetings: meetings,
    liveconference: liveconference,
    embedButton: embedButton
  };
};
