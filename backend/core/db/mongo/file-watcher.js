'use strict';

var chokidar = require('chokidar');
var fs = require('fs');
var hash_file = require('hash_file');
var activeWatchers = [];

function fileWatcher(logger, file, onChange) {
  var watchingConfig = false;
  var lastHash = null;

  return function fileWatcherInstance() {
    if (watchingConfig) {
      return false;
    }

    function startWatch() {
      logger.debug('Starting watching changed on file ' + file);
      function onFileChange() {
        hash_file(file, 'md5', function(err, hash) {
          if (err) {
            logger.debug('Got an error while computing md5 of ' + file + ': ' + err.message);
            return;
          }
          if (hash !== lastHash) {
            lastHash = hash;
            onChange();
          } else {
            logger.debug('Hash of ' + file + ' not modified');
          }
        });
      }

      var watcher = chokidar.watch(file, {persistent: false, ignoreInitial: true});
      watcher.on('add', onFileChange);
      watcher.on('change', onFileChange);
      watchingConfig = true;
      activeWatchers.push(watcher);
    }

    fs.stat(file, function(err, stat) {
      if (stat) {
        startWatch();
      }
    });
  };
}

/**
 * Clear active watchers
 */
fileWatcher.clear = function() {
  activeWatchers.forEach(function(watcher) {
    watcher.close();
  });
  activeWatchers = [];
};

/**
 * @type {fileWatcher}
 */
module.exports = fileWatcher;
