'use strict';

module.exports = function(grunt) {
  grunt.registerTask('prepare-quick-lint', function(arg) {
    var done = this.async();
    var spawn = require('child_process').spawn;

    var revision = grunt.option('r');
    var gitopts;
    if (revision) {
      gitopts = ['diff-tree', '--no-commit-id', '--name-only', '-r', revision];
    } else {
      gitopts = ['status', '--short', '--porcelain', '--untracked-files=no'];
    }
    var child = spawn('git', gitopts);

    var output = '';
    child.stdout.on('data', function(data) { output += data; });
    child.stdout.on('end', function() {
      var files = [];
      output.split('\n').forEach(function(line) {
        var filename = revision ? line : line.substr(3);
        var status = revision ? '' : line.substr(0, 3).trim();
        if (status !== 'D' && filename.substr(-3, 3) === '.js') {
          files.push(filename);
        }
      });
      if (files.length) {
        grunt.log.ok('Running linters on files:');
        grunt.log.oklns(grunt.log.wordlist(files));
        grunt.config.set('jshint.quick.src', files);
        done();
      } else {
        grunt.fail.fatal('No changed files');
        done(false);
      }
    });
  });
};
