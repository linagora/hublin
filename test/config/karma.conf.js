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
      '@linagora/karma-ng-jade2module-preprocessor'
    ],

    ngJade2ModulePreprocessor: {
      cacheIdFromPath: function(filepath) {
        var cacheId = '';

        if (filepath.match(/^frontend\/js*/)) {
          cacheId = '/views' + filepath.substr(11).replace('.jade', '.html');
        } else if (filepath.match(/^frontend*/)) {
          cacheId = filepath.substr(8).replace('.jade', '.html');
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
      moduleName: 'meetings.jade.templates'
    }

  });
};
