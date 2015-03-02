'use strict';

angular.module('meetings.wizard', [])
  .factory('widget.wizard', function() {
    function Wizard(steps, done) {
      var self = this;
      this.template = null;
      this.currentStep = 0;
      this.steps = steps;
      this.nextStep = function nextStep() {
        var nStep = self.currentStep + 1;
        if (!self.steps[nStep]) {
          if (done) {
            return done();
          }
          return;
        }
        self.template = self.steps[nStep];
        self.currentStep = nStep;
      };

      this.previousStep = function previousStep() {
        var pStep = this.currentStep - 1;
        if (!this.steps[pStep]) {
          return;
        }
        self.template = self.steps[pStep];
        self.currentStep = pStep;
      };
      this.init = function init() {
        self.template = steps[0];
      };

      this.init();
    }
    return Wizard;
  });
