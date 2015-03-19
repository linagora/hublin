'use strict';

var dependencies = require('./dependencies');

var extDeps = dependencies.externalDependencies();
var testDeps = dependencies.testDependencies();

module.exports = function(config) {
  var files = extDeps.map(function(dep) {
    return 'dist/' + dep;
  }).concat(testDeps).concat([
    'dist/frontend/js/**/*.js',
    'dist/frontend/views/**/*.jade',
    'test/unit-frontend/**/*.js'
  ]);

  config.set({
    basePath: '../../',
    files: files,
    exclude: [
    ],
    frameworks: ['mocha'],
    colors: true,
    singleRun: true,
    browsers: ['PhantomJS'],
    reporters: ['spec'],
    preprocessors: {
      'dist/frontend/views/**/*.jade': ['ng-jade2module']
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-mocha',
      'karma-spec-reporter',
      'karma-ng-jade2module-preprocessor'
    ],

    ngJade2ModulePreprocessor: {
      stripPrefix: 'dist/frontend',
      jadeRenderConfig: {
        __: function(str) { return str; }
      },
      moduleName: 'meetings.jade.templates'
    }

  });
};
