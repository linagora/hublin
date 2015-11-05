'use strict';

var mockery = require('mockery'),
    chai = require('chai'),
    expect = chai.expect;

var EVENTS = {
  invite: 'invite',
  john: 'doe',
  jane: 'dae'
};

describe('The conference pub/sub module', function() {

  it('should call addHistory when an event is published', function(done) {
    var conference = {
      addHistory: function(conference, user, event, callback) {
        expect(conference).to.deep.equals({ id: 'myConferenceId'});
        expect(user).to.deep.equals({ id: 'myUserId' });
        expect(event).to.equal('doe');

        done();
      },
      EVENTS: EVENTS
    };
    mockery.registerMock('./index.js', conference);

    this.helpers.mock.pubsub('../pubsub', {});
    this.helpers
      .requireBackend('core/conference/pubsub.js')
      .init(function(dependency) {
        return {};
      });

    require('../pubsub').local.topic(conference.EVENTS.john).publish({
      conference: { id: 'myConferenceId' },
      user: { id: 'myUserId' }
    });
  });

  it('should subscribe a listener for every event exposed by the conference module', function() {
    var localPubSub = {};

    mockery.registerMock('./index.js', {
      EVENTS: EVENTS
    });

    this.helpers.mock.pubsub('../pubsub', localPubSub);
    this.helpers
      .requireBackend('core/conference/pubsub.js')
      .init(function(dependency) {
        return {};
      });

    Object.keys(EVENTS).forEach(function(key) {
      expect(localPubSub.topics[EVENTS[key]].handler).to.have.length.of.at.least(1);
    });
  });

  describe('processInvitation event handler', function() {
    it('should call invitation.sendInvitation method', function(done) {
      var evt = {
        creator: 'user1',
        user: {objectType: 'email', id: 'some@test.com'},
        conference: 'conference1',
        baseUrl: 'https://hubl.in/'
      };

      mockery.registerMock('./index.js', {
        EVENTS: {
          invite: 'conference:invite'
        },
        addHistory: function() {}
      });

      var depencencies = {
        invitation: {
          sendInvitation: function(creator, user, conference, baseUrl, objType, callback) {
            expect(creator).to.equal(evt.creator);
            expect(user).to.deep.equal(evt.user);
            expect(conference).to.deep.equal(evt.conference);
            expect(baseUrl).to.equal(evt.baseUrl);
            expect(objType).to.equal(evt.user.objectType);
            done();
          }
        }
      };

      this.helpers.requireBackend('core/conference/pubsub.js').init(function(dependency) {
        return depencencies[dependency];
      });

      var pubsub = this.helpers.requireBackend('core').pubsub.local;
      pubsub.topic('conference:invite').publish(evt);

    });
  });
});
