'use strict';

var mockery = require('mockery');
var chai = require('chai');
var rewire = require('rewire');
var expect = chai.expect;
var ObjectId = require('bson').ObjectId;


describe('The conference module', function() {

  it('create should send back error when user is not set', function(done) {
    this.helpers.mock.models({});
    var conference = this.helpers.requireBackend('core/conference');
    conference.create(null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('create should create the conference when user is object', function(done) {
    var mongoose = {
      model: function() {
        return function() {
          return {
            save: function(callback) {
              return callback(null, {});
            }
          };
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference');
    var id = 123;
    conference.create({_id: id}, function(err, saved) {
      expect(err).to.not.exist;
      expect(saved).to.exist;
      done();
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
      conference.invite(conf, {}, attendees, function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should send back updated conference when attendees is object', function(done) {
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
      conference.invite(conf, {}, attendees, function(err, updated) {
        expect(err).to.not.exist;
        expect(updated).to.exist;
        expect(updated.members).to.exist;
        expect(updated.members.length).to.equal(1);
        done();
      });
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

      var conference = this.helpers.requireBackend('core/conference');
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

      var conference = this.helpers.requireBackend('core/conference');

      var creator = {id: 'creator'};
      var newMember = { id: 'newMemberId'};
      var conf = {
        members: [],
        history: [],
        save: function(callback) {
          callback(null, conf);
        }
      };

      conference.invite(conf, creator, newMember, function() {
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
      conference.userCanJoinConference({}, null, function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should send back error when conference is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userCanJoinConference(null, {}, function(err) {
        expect(err).to.exist;
        done();
      });
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
      conference.userIsConferenceMember({}, null, function(err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should send back error when conference is not set', function(done) {
      var mongoose = {
        model: function() {
          return {};
        }
      };
      this.mongoose = mockery.registerMock('mongoose', mongoose);

      var conference = this.helpers.requireBackend('core/conference');
      conference.userIsConferenceMember(null, {}, function(err) {
        expect(err).to.exist;
        done();
      });
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
    conference.userIsConferenceCreator({}, null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userIsConferenceCreator should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.userIsConferenceCreator(null, {}, function(err) {
      expect(err).to.exist;
      done();
    });
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
    conference.join(null, {}, function(err, status) {
      expect(err).to.exist;
      done();
    });
  });

  it('join should send back error when user is null', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference');
    conference.join({}, null, function(err, status) {
      expect(err).to.exist;
      done();
    });
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

    conference.join(conf, user, function(err, updated) {
      expect(err).to.not.exist;
      done();
    });
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
    conference.addHistory({}, null, 'hey', function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('addHistory should send back error when conference is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference');
    conference.addHistory(null, {}, 'hey', function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('addHistory should send back error when status is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference');
    conference.addHistory({}, {}, null, function(err) {
      expect(err).to.exist;
      done();
    });
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
      .addHistory({ id: 'myConferenceId' }, {}, {}, this.helpers.callbacks.noError(done));
  });

  it('addHistory should support a conference id', function(done) {
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
      .addHistory('myConferenceId', {}, {}, this.helpers.callbacks.noError(done));
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
      .addHistory('myConferenceId', { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
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
      .addHistory('myConferenceId', { id: 'myUserId', displayName: 'Sponge Bob' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
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
      .addHistory('myConferenceId', { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.noError(done));
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
      .addHistory('myConferenceId', { id: 'myUserId' }, 'myShinyEvent', this.helpers.callbacks.errorWithMessage(done, errorMessage));
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
});
