'use strict';

/**
 * Register the multitask splitfiles to run test files into separate node process
 * @param {object} grunt
 */
module.exports = function(grunt) {

  grunt.registerMultiTask('splitfiles', 'split the files and run separate targets', function() {
    var options = this.options({
      chunk: 50,
      common: []
    });

    if (!options.target) {
      grunt.fatal.fail('Missing target in options');
      return;
    }

    var files = this.files.reduce(function(a, b) {
      return a.concat(b.src);
    }, []);
    var totalFiles = files.length;

    var chunkSize = grunt.option('chunk');
    if (chunkSize === true) {
      chunkSize = options.chunk;
    } else if (typeof chunkSize === 'undefined') {
      chunkSize = totalFiles;
    }
    var commonFiles = grunt.file.expand(options.common);

    var targets = [];
    var configBase = options.target.replace(/:/g, '.');
    for (var chunkId = 1; files.length; chunkId++) {
      var chunkFiles = commonFiles.concat(files.splice(0, chunkSize));
      grunt.config.set(configBase + chunkId + '.options.files', chunkFiles);
      targets.push(options.target + chunkId);
    }

    if (targets.length > 1) {
        grunt.log.ok('Splitting ' + totalFiles + ' tests into ' + targets.length + ' chunks');
    }
    grunt.task.run(targets);
  });
};
