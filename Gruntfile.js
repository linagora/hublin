'use strict';

var fs = require('fs-extra');
var path = require('path');
var conf_path = './test/config/';
var servers = require(conf_path + 'servers-conf');
var config = require('./config/default.json');
var dist = 'dist';

/**
 *
 * @param {object} grunt
 */
module.exports = function(grunt) {
  var testArgs = (function() {
    var opts = ['test', 'chunk'];
    var args = {};
    opts.forEach(function(optName) {
      var opt = grunt.option(optName);
      if (opt) {
        args[optName] = '' + opt;
      }
    });
    return args;
  })();

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    templates: 'grunt-angular-templates'
  });

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    hublin: {
      client: require('./bower.json').appPath || 'frontend',
      dist: dist
    },
    concat: {
      options: {
        separator: ';'
      }
    },
    eslint: {
      all: {
        src: [
          'Gruntfile.js',
          'Gruntfile-tests.js',
          'tasks/**/*.js',
          'test/**/*.js',
          'backend/**/*.js',
          'frontend/js/**/*.js'
        ]
      },
      quick: {
        src: []
      }
    },
    lint_pattern: {
      options: {
        rules: [
          { pattern: /(describe|it)\.only/, message: 'Must not use .only in tests' }
        ]
      },
      all: {
        src: ['<%= eslint.all.src %>']
      },
      quick: {
        src: ['<%= eslint.quick.src %>']
      }
    },
    puglint: {
      all: {
        options: {
          config: {
            disallowAttributeInterpolation: true,
            disallowLegacyMixinCall: true,
            validateExtensions: true,
            validateIndentation: 2
          }
        },
        src: [
          'frontend/**/*.pug',
          'templates/**/*.pug'
        ]
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          env: {NODE_ENV: 'dev'},
          ignore: ['frontend/**', '.git', 'README.md', 'node_modules/**', 'test/**', 'doc/**', 'fixtures/**', 'log/**'],
          watchedExtensions: ['js'],
          callback: function(nodemon) {
            nodemon.on('log', function(event) {
              console.log(event.colour);
            });

            nodemon.on('config:update', function() {
              // Delay before server listens on port
              setTimeout(function() {
                require('open')('http://localhost:' + config.webserver.port || 8080);
              }, 2000);
            });
          }
        }
      }
    },
    run_grunt: {
      all: {
        options: {
          log: true,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          args: testArgs,
          process: function(res) {
            if (res.fail) {
              grunt.config.set('esn.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('esn.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          }
        },
        src: ['Gruntfile-tests.js']
      },
      midway_backend: {
        options: {
          log: true,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          args: testArgs,
          process: function(res) {
            if (res.fail) {
              grunt.config.set('esn.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('esn.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          },
          task: ['test-midway-backend']
        },
        src: ['Gruntfile-tests.js']
      },
      unit_backend: {
        options: {
          log: true,
          args: testArgs,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          process: function(res) {
            if (res.fail) {
              grunt.config.set('esn.tests.success', false);
              grunt.log.writeln('failed');
            } else {
              grunt.config.set('esn.tests.success', true);
              grunt.log.writeln('succeeded');
            }
          },
          task: ['test-unit-backend']
        },
        src: ['Gruntfile-tests.js']
      },
      test_frontend: {
        options: {
          log: true,
          args: testArgs,
          stdout: function(data) {
            grunt.log.write(data);
          },
          stderr: function(data) {
            grunt.log.error(data);
          },
          task: ['test-frontend']
        },
        src: ['Gruntfile-tests.js']
      }
    },
    watch: {
      files: ['<%= eslint.files %>'],
      tasks: ['eslint']
    },
    // Reads Jade files for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      jade: ['<%= hublin.client %>/views/meetings/index.pug', '<%= hublin.client %>/views/live-conference/index.pug'],
      options: {
        debug: true,
        dest: '<%= hublin.dist %>/frontend/js',
        patterns: {
          jade: require('usemin-patterns').jade
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      jade: ['<%= hublin.dist %>/**/index.pug'],
      js: ['<%= hublin.dist %>/js/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= hublin.dist %>/views'
        ],
        patterns: {
        },
        blockReplacements: {
          js: function(block) {
            return 'script(src="/js/' + block.dest + '")';
          }
        }
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*.js',
          dest: '.tmp/concat'
        }]
      }
    },
    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= hublin.dist %>/*',
            '!<%= hublin.dist %>/.git*'
          ]
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= hublin.client %>',
          dest: '<%= hublin.dist %>/frontend',
          src: [
            'components/**/*',
            'css/*.less',
            'images/*.{png,jpg}',
            'js/thirdparty/*.js',
            'views/**/*'
          ]
        }, {
          expand: true,
          dest: '<%= hublin.dist %>',
          src: [
            'backend/**/*',
            'config/*',
            'templates/*',
            '.bowerrc',
            'bower.json',
            'package.json',
            'server.js'
          ]
        }]
      }
    },
    karma: {
      dist: {
        configFile: './test/config/karma.conf.dist.js',
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-puglint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-continue');
  grunt.loadNpmTasks('@linagora/grunt-run-grunt');
  grunt.loadNpmTasks('@linagora/grunt-lint-pattern');
  grunt.loadNpmTasks('grunt-karma');

  grunt.loadTasks('tasks');

  grunt.registerTask('dist-files', 'Creates required files', function() {
    grunt.file.write('dist/log/application.log', '');
  });

  grunt.registerTask('clean-environment', 'remove temp folder for tests', function() {

    var testsFailed = !grunt.config.get('esn.tests.success');
    var applog = path.join(servers.tmp, 'application.log');

    if (testsFailed && fs.existsSync(applog)) {
      fs.copySync(applog, 'application.log');
    }
    fs.removeSync(servers.tmp);

    if (testsFailed) {
      grunt.log.writeln('Tests failure');
      grunt.fail.fatal('error', 3);
    }
  });

  grunt.registerTask('dist', [
    'clean:dist',
    'useminPrepare',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'uglify',
    'usemin',
    'dist-files'
  ]);

  grunt.registerTask('dev', ['nodemon:dev']);
  grunt.registerTask('test-unit-backend', ['run_grunt:unit_backend']);
  grunt.registerTask('test-frontend', ['run_grunt:test_frontend']);
  grunt.registerTask('test-midway-backend', ['run_grunt:midway_backend', 'clean-environment']);
  grunt.registerTask('test', ['test-frontend', 'run_grunt:unit_backend', 'run_grunt:midway_backend', 'clean-environment']);
  grunt.registerTask('linters', 'Check code for lint', ['eslint:all', 'lint_pattern:all', 'puglint:all']);

  grunt.registerTask('test-frontend-dist', 'Run the frontend distribution tests', ['karma:dist']);
  grunt.registerTask('test-dist', ['test-frontend-dist']);
  grunt.registerTask('dist-all', ['test', 'dist', 'test-dist']);

  /**
   * Usage:
   *   grunt linters-dev              # Run linters against files changed in git
   *   grunt linters-dev -r 51c1b6f   # Run linters against a specific changeset
   */
  grunt.registerTask('linters-dev', 'Check changed files for lint', ['prepare-quick-lint', 'eslint:quick', 'lint_pattern:quick']);

  grunt.registerTask('default', ['test']);
  grunt.registerTask('fixtures', 'Launch the fixtures injection', function() {
    var done = this.async();
    require('./fixtures')(function(err) {
      done(!err);
    });
  });
};
