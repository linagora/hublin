'use strict';

var dependencies = require('./dependencies');

module.exports = function(config) {

  var extDeps = dependencies.externalDependencies();
  var appDeps = dependencies.applicationDependencies();
  var testDeps = dependencies.testDependencies();
  var singleRun = process.env.SINGLE_RUN ? process.env.SINGLE_RUN !== 'false' : true;

  var files = extDeps.concat(testDeps).concat(appDeps).concat([
    'frontend/views/**/*.pug',
    'frontend/js/modules/**/*.pug',
    'test/unit-frontend/**/*.js',
    'frontend/js/**/*.spec.js'
  ]);

  config.set({
    basePath: '../../',
    files: files,
    exclude: [
      'frontend/js/analytics/*.js'
    ],
    frameworks: ['mocha'],
    colors: true,
    singleRun: singleRun,
    browsers: ['PhantomJS', 'Chrome', 'Chrome_Headless'],
    reporters: ['spec'],
    preprocessors: {
      '**/*.pug': ['ng-jade2module']
    },
    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222'],
        debug: true
      },
      Chrome_Headless: {
        base: 'Chrome',
        flags: ['--headless', '--enable-blink-features=GetUserMedia', '--disable-gpu', '--remote-debugging-port=9222']
      }
    },
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-spec-reporter',
      '@linagora/karma-ng-jade2module-preprocessor'
    ],

    ngJade2ModulePreprocessor: {
      cacheIdFromPath: function(filepath) {
        var cacheId = '';

        if (filepath.match(/^frontend\/js*/)) {
          cacheId = '/views' + filepath.substr(11).replace('.pug', '.html');
        } else if (filepath.match(/^frontend*/)) {
          cacheId = filepath.substr(8).replace('.pug', '.html');
        }

        return cacheId;
      },
      stripPrefix: 'frontend',
      jadeRenderLocals: {
        __: function(str) { return str; },
        __j: function(str) { return str; }
      },
      jadeRenderOptions: {
        basedir: require('path').resolve(__dirname, '../../frontend/views')
      },
      moduleName: 'meetings.pug.templates'
    }

  });
};
