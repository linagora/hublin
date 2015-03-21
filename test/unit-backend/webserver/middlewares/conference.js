'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');
var logger = require('../../../fixtures/logger-noop');
var q = require('q');

var MAX_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MAX_CONFERENCE_NAME_LENGTH;
var MIN_CONFERENCE_NAME_LENGTH = require('../../../../backend/constants').MIN_CONFERENCE_NAME_LENGTH;

describe('The conference middleware', function() {

  var dependencies, errors;

  before(function() {
    dependencies = function(name) {
      if (name === 'logger') {
        return logger();
      }
    };

    errors = this.helpers.requireBackend('webserver/errors')(dependencies);
  });

  it('load should set req.conference when id is set', function(done) {
    var result = {
      creator: 234
    };
    var conference = {
      get: function(id, callback) {
        return callback(null, result);
      }
    };
    mockery.registerMock('../../core/conference', conference);
    var controller = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies);
    var req = {
      params: {
        id: 123
      }
    };
    var resp = {};
    var next = function() {
      expect(req.conference).to.exist;
      expect(req.conference).to.deep.equal(result);
      done();
    };
    controller.load(req, resp, next);
  });

  it('loadWithAttendees should set req.conference when id is set', function(done) {
    var result = {
      creator: 234
    };
    var conference = {
      loadWithAttendees: function(id, callback) {
        return callback(null, result);
      }
    };
    mockery.registerMock('../../core/conference', conference);
    var controller = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies);
    var req = {
      params: {
        id: 123
      }
    };
    var resp = {};
    var next = function() {
      expect(req.conference).to.exist;
      expect(req.conference).to.deep.equal(result);
      done();
    };
    controller.loadWithAttendees(req, resp, next);
  });

  it('canJoin should send back HTTP 400 when user is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      conference: {}
    };
    this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('canJoin should send back HTTP 400 when conference is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {}
    };
    this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('canJoin should send back HTTP 500 when conference module sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(conference, user, callback) {
        return callback(new Error());
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    this.helpers.expectHttpError(errors.ServerError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('canJoin should send back HTTP 403 when conference module sends back false', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(conference, user, callback) {
        return callback(null, false);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    this.helpers.expectHttpError(errors.ForbiddenError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('canJoin should call next when user can join the conference', function(done) {
    mockery.registerMock('../../core/conference', {
      userCanJoinConference: function(cofnference, user, callback) {
        return callback(null, true);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canJoin;
    var req = {
      user: {},
      conference: {}
    };
    middleware(req, {}, done);
  });

  it('isAdmin should send back HTTP 400 when user is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      conference: {}
    };
    this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('isAdmin should send back HTTP 400 when conference is not set in request', function(done) {
    mockery.registerMock('../../core/conference', {});
    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {}
    };
    this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('isAdmin should send back HTTP 500 when conference module sends back error', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(new Error());
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    this.helpers.expectHttpError(errors.ServerError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('isAdmin should send back HTTP 403 when conference module sends back false', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(null, false);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    this.helpers.expectHttpError(errors.ForbiddenError, function(res, next) {
      middleware(req, res, next);
    }, done);
  });

  it('isAdmin should call next when user is admin of the conference', function(done) {
    mockery.registerMock('../../core/conference', {
      userIsConferenceCreator: function(conference, user, callback) {
        return callback(null, true);
      }
    });

    var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).isAdmin;
    var req = {
      user: {},
      conference: {}
    };
    middleware(req, {}, done);
  });

  describe('canAddAttendee function', function() {
    it('should send back HTTP 400 when user is not set in request', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
      var req = {
        conference: {}
      };
      this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
        middleware(req, res, next);
      }, done);
    });

    it('should send back HTTP 400 when conference is not set in request', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
      var req = {
        user: {}
      };
      this.helpers.expectHttpError(errors.BadRequestError, function(res, next) {
        middleware(req, res, next);
      }, done);
    });

    it('should send back HTTP 500 when conference#userIsConferenceMember fails', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
      var req = {
        user: {},
        conference: {}
      };
      this.helpers.expectHttpError(errors.ServerError, function(res, next) {
        middleware(req, res, next);
      }, done);
    });

    it('should call next when conference#userIsConferenceMember returns true', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(null, true);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
      var req = {
        user: {},
        conference: {}
      };
      middleware(req, this.helpers.expectNotCalled(done), done);
    });

    it('should send back HTTP 403 when conference#userIsConferenceMember returns false ', function(done) {
      mockery.registerMock('../../core/conference', {
        userIsConferenceMember: function(conference, user, callback) {
          return callback(null, false);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).canAddMember;
      var req = {
        user: {},
        conference: {}
      };
      this.helpers.expectHttpError(errors.ForbiddenError, function(res, next) {
        middleware(req, res, next);
      }, done);
    });
  });
  describe('lazyArchive middleware', function() {
    describe('initialized with loadFirst to true', function() {
      it('should call conference.get with req.params.id', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            expect(id).to.equal('conf1');
            done();
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
        });
      });
      it('should call next() if conference is not found', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback();
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
          done();
        });
      });
      it('should call next() if conference.get returns an error', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(new Error('Test'));
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
          done();
        });
      });
      it('should call conference.isActive() if conference.get returns a conference', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, {_id: 'conf1'});
          },
          isActive: function(conf) {
            done();
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
        });
      });
      it('should call conference.isActive() if conference.get returns a conference', function(done) {
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, {_id: 'conf1'});
          },
          isActive: function(conf) {
            done();
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
        });
      });
      it('should call conference.archive() if conference.isActive returns false', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, conf);
          },
          isActive: function(conf) {
            return q(false);
          },
          archive: function(conf) {
            expect(conf).to.deep.equal(conf);
            done();
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        middleware(req, {}, function() {
        });
      });
      it('should send back an error if something skrewed up in the process', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          get: function(id, callback) {
            callback(null, conf);
          },
          isActive: function(conf) {
            return q(false);
          },
          archive: function(conf) {
            return q.reject(new Error('test error'));
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(true);
        var req = {params: {id: 'conf1'}};
        this.helpers.expectHttpError(errors.ServerError, function(res, next) {
          middleware(req, res, next);
        }, { details: 'test error' }, done);
      });
    });
    describe('initialized with loadFirst to true', function() {
      it('should call next() if req.conference is not defined', function(done) {
        mockery.registerMock('../../core/conference', {});

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        middleware({}, {}, done);
      });
      it('should not delete req.conference if conference is still active', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          isActive: function(conf) {
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        var req = {conference: conf};
        middleware(req, {}, function() {
          expect(req.conference).to.deep.equal(conf);
          done();
        });
      });
      it('should delete req.conference if conference is not active', function(done) {
        var conf = {_id: 'conf1'};
        mockery.registerMock('../../core/conference', {
          isActive: function(conf) {
            return q(false);
          },
          archive: function(conf) {
            return q(true);
          }
        });

        var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).lazyArchive(false);
        var req = {conference: conf};
        middleware(req, {}, function() {
          expect(req).to.not.have.property('conference');
          done();
        });
      });
    });
  });

  describe('addUser function', function() {
    it('should call next when req.conference does not exists', function(done) {
      mockery.registerMock('../../core/conference', {});

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUser;
      middleware({}, this.helpers.expectNotCalled(done), done);
    });

    it('should send back 500 if conference#addUser fails', function(done) {
      mockery.registerMock('../../core/conference', {
        addUser: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUser;
      var req = {conference: {}};
      this.helpers.expectHttpError(errors.ServerError, function(res) {
        middleware(req, res, function() { done(new Error()); });
      }, done);
    });

    it('should send back 500 if conference#getMember fails', function(done) {
      mockery.registerMock('../../core/conference', {
        addUser: function(conference, user, callback) {
          return callback();
        },
        getMember: function(conference, user, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUser;
      var req = {conference: {}};
      this.helpers.expectHttpError(errors.ServerError, function(res) {
        middleware(req, res, function() { done(new Error()); });
      }, done);
    });

    it('should set req.user if member is found', function(done) {
      var member = {_id: 1};
      mockery.registerMock('../../core/conference', {
        addUser: function(conference, user, callback) {
          return callback();
        },
        getMember: function(conference, user, callback) {
          return callback(null, member);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUser;
      var req = {conference: {}};
      middleware(req, this.helpers.expectNotCalled(done), function() {
        expect(req.user).to.deep.equals(member);
        done();
      });
    });

    it('should call next when no errors', function(done) {
      var member = {_id: 1};
      mockery.registerMock('../../core/conference', {
        addUser: function(conference, user, callback) {
          return callback();
        },
        getMember: function(conference, user, callback) {
          return callback(null, member);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).addUser;
      var req = {conference: {}};
      middleware(req, this.helpers.expectNotCalled(done), done);
    });
  });

  describe('createConference function', function() {

    it('should call next if req.conference exists', function(done) {
      mockery.registerMock('../../core/conference', {
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).createConference;
      var req = {conference: {}, params: {id: 1}};
      middleware(req, this.helpers.expectNotCalled(done), done);
    });

    it('should send back 500 when conference#create fails', function(done) {
      mockery.registerMock('../../core/conference', {
        create: function(conf, callback) {
          return callback(new Error());
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).createConference;
      var req = {params: {id: 1}};
      this.helpers.expectHttpError(errors.ServerError, function(res) {
        middleware(req, res, function() { done(new Error()); });
      }, done);
    });

    it('should fill request when conference#create created conference', function(done) {
      var result = {_id: 1};
      mockery.registerMock('../../core/conference', {
        create: function(conf, callback) {
          return callback(null, result);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).createConference;
      var req = {params: {id: 1}};
      middleware(req, this.helpers.expectNotCalled(done), function() {
        expect(req.created).to.be.true;
        expect(req.conference).to.deep.equal(result);
        expect(req.user).to.not.exists;
        done();
      });
    });

    it('should set the req.user when conference#create result contains members', function(done) {
      var member1 = {_id: 2};
      var member2 = {_id: 3};
      var result = {_id: 1, members: [member1, member2]};
      mockery.registerMock('../../core/conference', {
        create: function(conf, callback) {
          return callback(null, result);
        }
      });

      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).createConference;
      var req = {params: {id: 1}};
      middleware(req, this.helpers.expectNotCalled(done), function() {
        expect(req.user).to.deep.equals(member1);
        done();
      });
    });
  });

  describe('checkIdLength function', function() {

    var expectNotCalled = function(done) {
      return {
        json: function() {
          done(new Error());
        }
      };
    };

    it('should send back HTTP 400 when id is too long', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).checkIdLength;

      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH + 1)
        }
      };

      this.helpers.expectHttpError(errors.BadRequestError, function(res) {
        middleware(req, res, function() { done(new Error()); });
      }, done);
    });

    it('should send back HTTP 400 when id is too short', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).checkIdLength;

      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH - 1)
        }
      };

      this.helpers.expectHttpError(errors.BadRequestError, function(res) {
        middleware(req, res, function() { done(new Error()); });
      }, done);
    });

    it('should call next when id length is at minimal length', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).checkIdLength;

      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MIN_CONFERENCE_NAME_LENGTH)
        }
      };

      middleware(req, expectNotCalled(done), done);
    });

    it('should call next when id length is at maximal length', function(done) {
      mockery.registerMock('../../core/conference', {});
      var middleware = this.helpers.requireBackend('webserver/middlewares/conference')(dependencies).checkIdLength;

      var req = {
        params: {
          id: this.helpers.utils.generateStringWithLength(MAX_CONFERENCE_NAME_LENGTH)
        }
      };

      middleware(req, expectNotCalled(done), done);
    });
  });
});
