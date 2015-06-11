'use strict';

var mockery = require('mockery');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;
var ObjectId = require('bson').ObjectId;


describe('The conference module', function() {

  it('create should send back error when conference is not set', function(done) {
    this.helpers.mock.models({});
    this.helpers.requireBackend('core/conference').create(null, this.helpers.callbacks.error(done));
  });

  it('create should create the conference when user is object', function(done) {
    var mongoose = {
      model: function() {
        return function(object) {
          return {
            save: function(callback) {
              return callback(null, object);
            }
          };
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    mockery.registerMock('./scalability', function(conference, callback) { return callback(null, conference); });

    this.helpers
      .requireBackend('core/conference')
      .create({
        _id: 123,
        members: [{
          id: 'myUSerId'
        }]
      }, function(err, saved) {
        expect(err).to.not.exist;
        expect(saved).to.exist;
        done();
      });
  });

  it('create should send back error when the scalability module fails', function(done) {
    this.helpers.mock.models({});
    mockery.registerMock('./scalability', function(conference, callback) { return callback(new Error('WTF')); });

    this.helpers
      .requireBackend('core/conference')
      .create({}, this.helpers.callbacks.errorWithMessage(done, 'WTF'));
  });

  describe('the sendInvitation function', function() {
    var member = {id: 'yo@hubl.in', objectType: 'email'};
    var creator = {id: 'yo@hubl.in', objectType: 'email'};
    var conf = {_id: 'MyConf'};
    var mongoose = {
      model: function() {
        return {};
      }
    };

    it('should send back error if the member retrieval returns error', function(done) {
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = rewire('../../../../backend/core/conference');
      var getMember = function(conference, member, callback) {return callback(new Error('Test Error'));};
      conference.__set__('getMember', getMember);

      conference.sendInvitation(conf, creator, member, function(err, m) {
        expect(err).to.exist;
        expect(err).to.match(/Test Error/);
        done();
      });
    });

    it('should send back error if the member retrieval does not return member', function(done) {
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = rewire('../../../../backend/core/conference');
      var getMember = function(conference, member, callback) {return callback();};
      conference.__set__('getMember', getMember);

      conference.sendInvitation(conf, creator, member, function(err) {
        expect(err).to.exist;
        expect(err).to.match(/No such member found/);
        done();
      });
    });

    it('should forward invitation into conference:invite', function(done) {
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var expected = {
        conference: conf,
        user: member,
        creator: creator
      };

      var localstub = {}, globalstub = {};
      this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

      var conference = rewire('../../../../backend/core/conference');
      var getMember = function(conference, user, callback) {return callback(null, user);};
      conference.__set__('getMember', getMember);

      conference.sendInvitation(conf, creator, member, function() {
        expect(localstub.topics['conference:invite'].data[0]).to.deep.equal(expected);
        expect(globalstub.topics['conference:invite'].data[0]).to.deep.equal(expected);
        done();
      });
    });
  });

  describe('the invite function', function() {
    it('should send back error when conference is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);
      var conference = this.helpers.requireBackend('core/conference');
      conference.invite(null, {}, {},function(err, saved) {
        expect(err).to.exist;
        expect(saved).to.not.exist;
        done();
      });
    });

    it('should send back error when attendees is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);
      var conference = this.helpers.requireBackend('core/conference');
      conference.invite({}, {}, null, function(err, saved) {
        expect(err).to.exist;
        expect(saved).to.not.exist;
        done();
      });
    });

    it('should send back error when conference and attendees are not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);
      var conference = this.helpers.requireBackend('core/conference');
      conference.invite(null, {}, null, function(err, saved) {
        expect(err).to.exist;
        expect(saved).to.not.exist;
        done();
      });
    });

    it('should send back error when conference.save send back error', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var attendees = {
        _id: 123
      };

      var conf = {
        save: function(callback) {
          return callback(new Error());
        },
        members: []
      };

      var conference = this.helpers.requireBackend('core/conference');
      conference.invite(conf, {}, attendees, this.helpers.callbacks.error(done));
    });

    it('should return an error when attendees is object', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var attendees = {
        _id: 123
      };

      var conf = {
        members: [],
        save: function(callback) {
          var self = this;
          return callback(null, {members: self.members});
        }
      };

      var conference = this.helpers.requireBackend('core/conference');
      conference.invite(conf, {}, attendees, this.helpers.callbacks.errorWithMessage(done, 'members parameter should be an array'));
    });

    it('should send back updated conference when attendees is array', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var attendees = [
        {
          _id: 123
        },
        {
          _id: 456
        }
      ];

      var conf = {
        members: [],
        save: function(callback) {
          var self = this;
          return callback(null, {members: self.members});
        }
      };

      var conference = rewire('../../../../backend/core/conference');
      var sendInvitation = function(conference, creator, user, callback) {return callback();};
      conference.__set__('sendInvitation', sendInvitation);

      conference.invite(conf, {}, attendees, function(err, updated) {
        expect(err).to.not.exist;
        expect(updated).to.exist;
        expect(updated.members).to.exist;
        expect(updated.members.length).to.equal(2);
        done();
      });
    });

    it('invite should forward invitation into conference:invite', function(done) {
      this.mongoose = mockery.registerMock('mongoose', {
        model: function() {
          return {};
        }
      });

      var localstub = {}, globalstub = {};
      this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

      var creator = {id: 'creator'};
      var newMember = { id: 'newMemberId'};
      var conf = {
        members: [],
        history: [],
        save: function(callback) {
          callback(null, conf);
        }
      };

      var conference = rewire('../../../../backend/core/conference');
      var getMember = function(conference, user, callback) {return callback(null, user);};
      conference.__set__('getMember', getMember);

      conference.invite(conf, creator, [newMember], function() {
        expect(localstub.topics['conference:invite'].data[0]).to.deep.equal({
          conference: conf,
          user: newMember,
          creator: creator
        });
        expect(globalstub.topics['conference:invite'].data[0]).to.deep.equal({
          conference: conf,
          user: newMember,
          creator: creator
        });
        done();
      });
    });
  });

  describe('userCanJoinConference function', function() {
    it('should send back error when user is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userCanJoinConference({}, null, this.helpers.callbacks.error(done));
    });

    it('should send back error when conference is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userCanJoinConference(null, {}, this.helpers.callbacks.error(done));
    });

    it('should send true when user is conference creator', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var user_id = new ObjectId();
      var conf = {
        creator: user_id,
        attendees: []
      };

      var user = {
        _id: user_id
      };

      var conference = this.helpers.requireBackend('core/conference');
      conference.userCanJoinConference(conf, user, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.be.true;
        done();
      });
    });

    it('should send true when user is attendee', function(done) {
      var user = {
        _id: new ObjectId(),
        id: 'me@linagora.com'
      };

      var conf = {
        creator: new ObjectId(),
        members: [
          {id: user.id},
          {id: 'myfriend@linagora.com'}
        ]
      };

      var mongoose = {
        model: function() {
          return {
            findOne: function() {
              return {
                exec: function(callback) {
                  return callback(null, conf);
                }
              };
            }
          };
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userCanJoinConference(conf, user, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.be.true;
        done();
      });
    });

    it('userCanJoinConference should send false when user is not in attendees list', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conf = {
        creator: new ObjectId(),
        attendees: [
          {user: new ObjectId()}
        ]
      };

      var user = {
        _id: new ObjectId()
      };

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceCreator(conf, user, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.be.false;
        done();
      });
    });
  });


  describe('userIsConferenceMember function', function() {
    it('should send back error when user is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceMember({}, null, this.helpers.callbacks.error(done));
    });

    it('should send back error when conference is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceMember(null, {}, this.helpers.callbacks.error(done));
    });

    it('should send true when user is in attendee list', function(done) {
      var user = {
        id: 'me@linagora.com'
      };

      var conf = {
        creator: 123,
        members: [
          {id: user.id},
          {id: 111}
        ]
      };

      var mongoose = {
        model: function() {
          return {
            findOne: function() {
              return {
                exec: function(callback) {
                  return callback(null, conf);
                }
              };
            }
          };
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceMember(conf, user, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.be.true;
        done();
      });
    });

    it('should send false when user is not in attendees list', function(done) {
      var user = {
        id: 'me@linagora.com'
      };

      var conf = {
        creator: 123,
        members: [
        ]
      };

      var mongoose = {
        model: function() {
          return {
            findOne: function() {
              return {
                exec: function(callback) {
                  return callback(null, conf);
                }
              };
            }
          };
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceMember(conf, user, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.be.false;
        done();
      });
    });
  });

  it('userIsConferenceCreator should send back error when user is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.userIsConferenceCreator({}, null, this.helpers.callbacks.error(done));
  });

  it('userIsConferenceCreator should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.userIsConferenceCreator(null, {}, this.helpers.callbacks.error(done));
  });

  it('userIsConferenceCreator should send true when user is conference creator', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conf = {
      creator: new ObjectId()
    };

    var user = {
      _id: conf.creator
    };

    var conference = this.helpers.requireBackend('core/conference');
    conference.userIsConferenceCreator(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userIsConferenceCreator should send false when user is not conference creator', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conf = {
      creator: new ObjectId()
    };

    var user = {
      _id: new ObjectId()
    };

    var conference = this.helpers.requireBackend('core/conference');
    conference.userIsConferenceCreator(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.false;
      done();
    });
  });

  it('join should send back error when conference is null', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.join(null, {}, this.helpers.callbacks.error(done));
  });

  it('join should send back error when user is null', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.join({}, null, this.helpers.callbacks.error(done));
  });

  it('join call update on Conference', function(done) {

    var user = {
      _id: 123
    };

    var conf = {
      creator: 333,
      members: [],
      history: [],
      save: function(callback) {
        var self = this;
        expect(self.members.length === 1);
        return callback(null, {members: self.members});
      }
    };

    var mongoose = {
      model: function() {
        return {
          update: function(a, b, c, callback) {
            return callback(null, 1);
          }
        };
      }
    };
    mongoose.Types = { ObjectId: function() {} };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = rewire('../../../../backend/core/conference');
    var addUser = function(conference, user, callback) {return callback();};
    conference.__set__('addUser', addUser);

    conference.join(conf, user, this.helpers.callbacks.noError(done));
  });

  it('join send back error when user can not be added first', function(done) {

    var mongoose = {
      model: function() {
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = rewire('../../../../backend/core/conference');
    var addUser = function(conference, user, callback) {return callback(new Error('1'));};
    conference.__set__('addUser', addUser);

    conference.join({}, {}, function(err) {
      expect(err).to.exist;
      expect(err.message).to.equal('1');
      done();
    });
  });

  it('addHistory should send back error when user is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference');
    conference.addHistory({}, null, 'hey', this.helpers.callbacks.error(done));
  });

  it('addHistory should send back error when conference is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference');
    conference.addHistory(null, {}, 'hey', this.helpers.callbacks.error(done));
  });

  it('addHistory should send back error when status is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference');
    conference.addHistory({}, {}, null, this.helpers.callbacks.error(done));
  });

  it('addHistory should support a Conference object', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            expect(value).to.deep.equals({
              _id: 'myConferenceId'
            });

            return callback();
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, {}, {}, this.helpers.callbacks.noError(done));
  });

  it('addHistory should push a new element in the conference history', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            expect(value).to.deep.equals({
              _id: 'myConferenceId'
            });
            expect(options).to.deep.equals({
              $push: {
                history: {
                  verb: 'event',
                  target: [{
                    objectType: 'conference',
                    _id: 'myConferenceId'
                  }],
                  object: {
                    objectType: 'event',
                    _id: 'myShinyEvent'
                  },
                  actor: {
                    objectType: 'hublin:anonymous',
                    _id: 'myUserId',
                    displayName: ''
                  }
                }
              }
            });

            return callback();
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
  });

  it('addHistory should push a new element in the conference history, using the user\'s objectType', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            expect(value).to.deep.equals({
              _id: 'myConferenceId'
            });
            expect(options).to.deep.equals({
              $push: {
                history: {
                  verb: 'event',
                  target: [{
                    objectType: 'conference',
                    _id: 'myConferenceId'
                  }],
                  object: {
                    objectType: 'event',
                    _id: 'myShinyEvent'
                  },
                  actor: {
                    objectType: 'hublin:member',
                    _id: 'myUserId',
                    displayName: ''
                  }
                }
              }
            });

            return callback();
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, { id: 'myUserId', objectType: 'hublin:member' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
  });

  it('addHistory should push a new element in the conference history, including the user\'s displayName', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            expect(value).to.deep.equals({
              _id: 'myConferenceId'
            });
            expect(options).to.deep.equals({
              $push: {
                history: {
                  verb: 'event',
                  target: [{
                    objectType: 'conference',
                    _id: 'myConferenceId'
                  }],
                  object: {
                    objectType: 'event',
                    _id: 'myShinyEvent'
                  },
                  actor: {
                    objectType: 'hublin:anonymous',
                    _id: 'myUserId',
                    displayName: 'Sponge Bob'
                  }
                }
              }
            });

            return callback();
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, { id: 'myUserId', displayName: 'Sponge Bob' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
  });

  it('addHistory should not upsert', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            expect(upsert).to.deep.equals({
              upsert: false
            });

            return callback();
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
  });

  it('addHistory should send back an error when it cannot update a conference', function(done) {
    var errorMessage = 'Hey Bob, you are not a real sponge, are you?';

    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            return callback(new Error(errorMessage));
          }
        };
      }
    });

    this.helpers
      .requireBackend('core/conference')
      .addHistory({ _id: 'myConferenceId' }, { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.errorWithMessage(done, errorMessage));
  });

  it('join should forward invitation into conference:join', function(done) {

    var conf = {
      _id: 12345,
      members: [],
      history: [],
      save: function(callback) {
        callback(null, { _id: 12345 });
      }
    };

    var user = {_id: 123};

    var mongoose = {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            return callback(null, 1);
          }
        };
      }
    };
    mongoose.Types = { ObjectId: function() {} };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var localstub = {}, globalstub = {};
    this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

    var conference = rewire('../../../../backend/core/conference');
    var addUser = function(conference, user, callback) {return callback();};
    conference.__set__('addUser', addUser);

    conference.join(conf, user, function() {
      expect(localstub.topics['conference:join'].data[0]).to.deep.equal({
        conference: conf,
        user: user
      });
      expect(globalstub.topics['conference:join'].data[0]).to.deep.equal({
        conference: conf,
        user: user
      });
      done();
    });
  });

  it('leave should forward invitation into conference:leave', function(done) {

    var conf = {
      _id: 12345,
      members: [],
      history: []
    };

    var user = { _id: 123};

    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            return callback(null, 1);
          }
        };
      }
    });

    var localstub = {}, globalstub = {};
    this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

    var conference = rewire('../../../../backend/core/conference');
    conference.__set__('userIsConferenceMember', function(conference, user, callback) {
      return callback(null, true);
    });

    conference.leave(conf, user, function() {
      expect(localstub.topics['conference:leave'].data[0]).to.deep.equal({
        conference: conf,
        user: user
      });
      expect(globalstub.topics['conference:leave'].data[0]).to.deep.equal({
        conference: conf,
        user: user
      });
      done();
    });
  });

  it('create should publish conference:create event when creation succeeds', function(done) {
    var conference = {
      _id: 'myConferenceId',
      members: [{
        id: 'myUserId'
      }]
    };

    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return function(object) {
          return {
            save: function(callback) {
              callback(null, object);
            }
          };
        };
      }
    });

    this.helpers.mock.pubsub('../pubsub', {});
    require('../pubsub').local.topic('conference:create').subscribe(function(data) {
      expect(data).to.deep.equals({
        conference: conference,
        user: conference.members[0]
      });

      done();
    });

    mockery.registerMock('./scalability', function(conference, callback) { return callback(null, conference); });

    this.helpers
      .requireBackend('core/conference')
      .create(conference, function() {});
  });

  it('create should not publish conference:create event when creation fails', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return function() {
          return {
            save: function(callback) {
              callback(new Error('WTF'));
            }
          };
        };
      }
    });

    var localPubSub = {};
    this.helpers.mock.pubsub('../pubsub', localPubSub);

    mockery.registerMock('./scalability', function(conference, callback) { return callback(null, conference); });

    this.helpers
      .requireBackend('core/conference')
      .create({}, function(err) {
        expect(err).to.exist;
        expect(localPubSub.topics['conference:create']).to.not.exist;

        done();
      });
  });

  describe('isActive() method', function() {
    it('should return a promise', function() {
      this.helpers.mock.models({});
      var conf = this.helpers.requireFixture('conference').inactive();
      var promise = this.helpers
        .requireBackend('core/conference')
        .isActive(conf);
      expect(promise).to.have.property('then');
      expect(promise).to.have.property('catch');
    });

    it('should resolve to false when ttl is over, and there is not user in online state', function(done) {
      this.helpers.mock.models({});
      var conf = this.helpers.requireFixture('conference').inactive();
      this.helpers
        .requireBackend('core/conference')
        .isActive(conf)
        .then(function(active) {
          expect(active).to.be.false;
          done();
        }, done);
    });
    it('should resolve to true when ttl is not over', function(done) {
      this.helpers.mock.models({});
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.timestamps.created = new Date();
      this.helpers
        .requireBackend('core/conference')
        .isActive(conf)
        .then(function(active) {
          expect(active).to.be.true;
          done();
        }, done);
    });
    it('should resolve to true when ttl is over, and at least one user is online', function(done) {
      this.helpers.mock.models({});
      var conf = this.helpers.requireFixture('conference').activeMember();
      conf.timestamps.created = new Date();
      this.helpers
        .requireBackend('core/conference')
        .isActive(conf)
        .then(function(active) {
          expect(active).to.be.true;
          done();
        }, done);
    });
    it('should resolve to false when garbage ttl is over, and at least one user is online', function(done) {
      this.helpers.mock.models({});
      var conf = this.helpers.requireFixture('conference').garbage();
      this.helpers
        .requireBackend('core/conference')
        .isActive(conf)
        .then(function(active) {
          expect(active).to.be.false;
          done();
        }, done);
    });
  });

  describe('archive() method', function() {
    it('should return a promise', function() {
      this.helpers.mock.models({
        ConferenceArchive: function() {
          return {
            save: function() {}
          };
        }
      });
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.toObject = function() {
        return conf;
      };
      var promise = this.helpers
        .requireBackend('core/conference')
        .archive(conf);
      expect(promise).to.have.property('then');
      expect(promise).to.have.property('catch');
    });
    it('should reject the promise when the save() call fails', function(done) {
      this.helpers.mock.models({
        ConferenceArchive: function() {
          return {
            save: function(cb) { return cb(new Error('test'));},
            toObject: function() {
              return {};
            }
          };
        }
      });
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.toObject = function() {
        return conf;
      };
      this.helpers
        .requireBackend('core/conference')
        .archive(conf)
        .then(
          function() {
            return done('I should not be called');
          },
          function(err) {
            done();
          }
        );
    });
    it('should call Conference.remove() if archive record succeeded', function(done) {
      var conferenceArchive = {
        initial_id: 'conf1'
      };
      this.helpers.mock.models({
        ConferenceArchive: function() {
          return {
            save: function(cb) { return cb(null, conferenceArchive);}
          };
        },
        Conference: {
          remove: function() {return done();}
        }
      });
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.toObject = function() {
        return conf;
      };
      this.helpers
        .requireBackend('core/conference')
        .archive(conf)
        .then(
          function() {
            return done('I should not be called');
          },
          function(err) {
            return done('I should not be called');
          }
        );
    });
    it('should reject the promise when Conference.remove() fails', function(done) {
      var conferenceArchive = {
        initial_id: 'conf1'
      };
      this.helpers.mock.models({
        ConferenceArchive: function() {
          return {
            save: function(cb) { return cb(null, conferenceArchive);}
          };
        },
        Conference: {
          remove: function(conf, cb) {return cb(new Error('test'));}
        }
      });
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.toObject = function() {
        return conf;
      };
      this.helpers
        .requireBackend('core/conference')
        .archive(conf)
        .then(
          function() {
            return done('I should not be called');
          },
          function(err) {
            done();
          }
        );
    });
    it('should resolve the promise with archivedConference', function(done) {
      var conferenceArchive = {
        initial_id: 'conf1'
      };
      this.helpers.mock.models({
        ConferenceArchive: function() {
          return {
            save: function(cb) { return cb(null, conferenceArchive);}
          };
        },
        Conference: {
          remove: function(conf, cb) {return cb();}
        }
      });
      var conf = this.helpers.requireFixture('conference').inactive();
      conf.toObject = function() {
        return conf;
      };
      this.helpers
        .requireBackend('core/conference')
        .archive(conf)
        .then(
          function(arch) {
            expect(arch).to.deep.equals(conferenceArchive);
            done();
          },
          function(err) {
            return done('I should not be called');
          }
        );
    });
  });

});
