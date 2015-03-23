'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The meetings.report module', function() {

  beforeEach(function() {
    var notificationFactory = {
      weakInfo: function() {}
    },
    $alert = {
      $show: function() {},
      $hide: function() {},
      $toggle: function() {}
    };

    angular.mock.module('meetings.report');
    angular.mock.module('meetings.conference');
    angular.mock.module('meetings.jade.templates');
    angular.mock.module(function($provide) {
      $provide.value('notificationFactory', notificationFactory);
      $provide.value('$alert', $alert);
    });
  });

  describe('The create-report-modal directive', function() {
    var $rootScope, $compile;
    var modalElt, textareaElt, formElt, btnSendElt, btnCancelElt, errorElt, titreElt;
    var expectedBody;

    beforeEach(angular.mock.inject(function(_$rootScope_, _$compile_, conferenceAPI, notificationFactory, $httpBackend, MAX_REPORT_DESCRIPTION_LENGTH) {

      this.conferenceAPI = conferenceAPI;
      this.MAX_REPORT_DESCRIPTION_LENGTH = MAX_REPORT_DESCRIPTION_LENGTH;

      $rootScope = _$rootScope_;
      $compile = _$compile_;

      $rootScope.reportedSnapshot = {
        displayName: 'yan',
        id: '550ae95bdfeedfd52d9f6a49'
      };
      $rootScope.conferenceSnapshot = {
        conference: {
          _id: 'testFrontend'
        },
        attendees: [
          {
            displayName: 'yan',
            id: '550ae95bdfeedfd52d9f6a49'
          },
          {
            displayName: 'Romain',
            id: '550aea4ddfeedfd52d9f6a4e'
          },
          {
            displayName: 'joe',
            id: '550ae95bdfeedfd52d9f6a92'
          },
          {
            displayName: 'cocker',
            id: '550aea4ddfeedfd52d9f6bf8'
          }
        ]
      };

      $rootScope.reportedText = '';

      expectedBody = {
        reported: '550ae95bdfeedfd52d9f6a49',
        members: ['550ae95bdfeedfd52d9f6a49', '550aea4ddfeedfd52d9f6a4e', '550ae95bdfeedfd52d9f6a92', '550aea4ddfeedfd52d9f6bf8'],
        description: 'front-end test description'
      };

      modalElt = $compile('<report-dialog id="#reportModal"></report-dialog>')($rootScope);
      $rootScope.$digest();

      textareaElt = modalElt.find('textarea');
      formElt = modalElt.find('#reportForm');
      btnCancelElt = modalElt.find('button[data-dismiss="modal"]');
      btnSendElt = modalElt.find('button[ng-click="sendReport()"]');
      errorElt = modalElt.find('span');
      titreElt = modalElt.find('h4');

      $rootScope.hide = function() {
        modalElt.hide();
      };

      this.$httpBackend = $httpBackend;
    }));

    it('should correctly build and initiate the report modal', function(done) {
      expect(modalElt).to.exist;
      expect(textareaElt).to.exist;
      expect(formElt).to.exist;
      expect(btnSendElt).to.exist;
      expect(btnCancelElt).to.exist;
      expect(errorElt).to.exist;

      $rootScope.$digest();

      expect(textareaElt.val()).to.be.empty;
      expect(errorElt.hasClass('ng-show')).to.be.false;
      expect(titreElt.contents()[0].data).to.have.string($rootScope.reportedSnapshot.displayName);
      expect(btnSendElt.attr('disabled')).to.equal('disabled');

      done();
    });

    it('should enable the send button when a description is entered', function(done) {
      $rootScope.reportedText = 'something';
      $rootScope.$digest();

      expect(btnSendElt.attr('disabled')).to.be.undefined;
      done();
    });

    it('should disable the send button when too many characters are entered (~5000)', function(done) {

      $rootScope.reportedText = new Array(this.MAX_REPORT_DESCRIPTION_LENGTH + 1).join('A');

      $rootScope.$digest();

      expect(btnSendElt.attr('disabled')).to.be.undefined;


      $rootScope.reportedText += 'A';
      $rootScope.$digest();

      expect(btnSendElt.attr('disabled')).to.equal('disabled');
      done();
    });

    it('should launch a post call to /api/conferences/:id/reports/', function(done) {
      $rootScope.reportedText = expectedBody.description;

      this.$httpBackend.expectPOST('/conferences/testFrontend/reports', expectedBody).respond(201);

      btnSendElt.click();
      $rootScope.$digest();

      this.$httpBackend.flush();
      done();
    });

    it('should reset the description textfield after a new report creation', function(done) {
      $rootScope.reportedText = expectedBody.description;
      $rootScope.$digest();
      expect(textareaElt.val()).to.equal(expectedBody.description);

      this.$httpBackend.expectPOST('/conferences/testFrontend/reports', expectedBody).respond(201);

      btnSendElt.click();
      $rootScope.$digest();

      this.$httpBackend.flush();
      expect(textareaElt.val()).to.be.empty;
      done();
    });
  });
});
