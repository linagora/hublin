'use strict';

var expect = require('chai').expect,
    logger = require('../../../fixtures/logger-noop'),
    mockery = require('mockery');

describe('The user middleware', function() {
  var dependencies = {
    'logger': logger()
  };
  var deps = function(name) {
    return dependencies[name];
  };

  beforeEach(function() {
    mockery.registerMock('../../core/conference', {});
    mockery.registerMock('node-uuid', {
      v4: function() {
        return 'uuid';
      }
    });
  });

  describe('The createForConference function', function() {

    it('should do nothing if user already exist', function(done) {
      var req = {
        params: {
          id: '123'
        },
        session: {
          conferenceToUser: {
            '123': {}
          }
        }
      };

      this.helpers
        .requireBackend('webserver/middlewares/user')(deps)
        .createForConference(req, null, function() {
          expect(req.user.objectType).to.not.exist;

          done();
        });
    });

    it('should define the user object if it does not already exist, and use the given displayName', function(done) {
      var req = {
        params: {
          id: '123'
        },
        session: {},
        query: {
          displayName: 'SpongeBob'
        },
        headers: {
          'user-agent': 'jamesbond'
        },
        ip: '1.2.3.4',
        res: {
          cookie: function() {},
          header: function() {}
        }
      };

      this.helpers
        .requireBackend('webserver/middlewares/user')(deps)
        .createForConference(req, null, function() {
          expect(req.user).to.deep.equal({
            objectType: 'hublin:anonymous',
            id: 'uuid',
            token: 'uuid',
            displayName: 'SpongeBob',
            connection: {
              ipAddress: '1.2.3.4',
              userAgent: 'jamesbond'
            }
          });

          done();
        });
    });

    it('should define the user object if it does not already exist, and define anonymous when no displayName is given', function(done) {
      var req = {
        params: {
          id: '123'
        },
        session: {},
        query: {},
        headers: {
          'user-agent': 'jamesbond'
        },
        ip: '1.2.3.4',
        res: {
          cookie: function() {},
          header: function() {}
        }
      };

      this.helpers
        .requireBackend('webserver/middlewares/user')(deps)
        .createForConference(req, null, function() {
          expect(req.user).to.deep.equal({
            objectType: 'hublin:anonymous',
            id: 'uuid',
            token: 'uuid',
            displayName: 'anonymous',
            connection: {
              ipAddress: '1.2.3.4',
              userAgent: 'jamesbond'
            }
          });

          done();
        });
    });

    it('should define a X-hublin-header in the response containing the user token', function(done) {
      var headerName, headerValue;
      var req = {
        params: {
          id: '123'
        },
        session: {},
        query: {},
        headers: {
          'user-agent': 'jamesbond'
        },
        ip: '1.2.3.4',
        res: {
          cookie: function() {},
          header: function(name, value) {
            headerName = name;
            headerValue = value;
          }
        }
      };

      this.helpers
        .requireBackend('webserver/middlewares/user')(deps)
        .createForConference(req, null, function() {
          expect(headerName).to.equal('X-Hublin-Token');
          expect(headerValue).to.equal('uuid');
          done();
        });
    });

  });

});
