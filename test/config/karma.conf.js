'use strict';

module.exports = function(config) {
  config.set({
    basePath: '../../',
    files: [
      'frontend/components/jquery/dist/jquery.js',
      'frontend/components/angular/angular.js',
      'frontend/components/angular-route/angular-route.js',
      'frontend/components/angular-cookies/angular-cookies.min.js',
      'frontend/components/angular-mocks/angular-mocks.js',
      'frontend/components/underscore/underscore.js',
      'frontend/components/restangular/dist/restangular.js',
      'frontend/components/chai/chai.js',
      'frontend/js/**/*.js',
      'frontend/views/**/*.jade',
      'test/unit-frontend/**/*.js'
    ],
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
        __: function(str) { return str; }
      },
      moduleName: 'meetings.jade.templates'
    }

  });
};
