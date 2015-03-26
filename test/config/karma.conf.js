'use strict';

var dependencies = require('./dependencies');

module.exports = function(config) {

  var extDeps = dependencies.externalDependencies();
  var appDeps = dependencies.applicationDependencies();
  var testDeps = dependencies.testDependencies();

  var files = extDeps.concat(testDeps).concat(appDeps).concat([
    'frontend/views/**/*.jade',
    'test/unit-frontend/**/*.js'
  ]);

  config.set({
    basePath: '../../',
    files: files,
    exclude: [
      'frontend/js/analytics/*.js'
    ],
    frameworks: ['mocha'],
    colors: true,
    singleRun: true,
    browsers: ['PhantomJS'],
    reporters: ['spec'],
    preprocessors: {
      'frontend/views/**/*.jade': ['ng-jade2module']
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-mocha',
      'karma-spec-reporter',
      'karma-ng-jade2module-preprocessor'
    ],

    ngJade2ModulePreprocessor: {
      stripPrefix: 'frontend',
      jadeRenderConfig: {
        __: function(str) { return str; },
        __j: function(str) { return str; }
      },
      moduleName: 'meetings.jade.templates'
    }

  });
};
