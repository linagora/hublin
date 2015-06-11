'use strict';

var async = require('async'),
    chai = require('chai'),
    expect = chai.expect,
    MongoClient = require('mongodb').MongoClient,
    mockery = require('mockery'),
    crypto = require('crypto'),
    domain = require('domain');

/*
 * Mocks esnConf(<key>) object.
 * get: callback of the esnConf(<key>).get(get) method.
 */
function mockEsnConfig(get) {
  var mockedEsnConfig = {
    'esn-config': function() {
      return {
        get: get
      };
    }
  };
  var mockedEsnConfigFunction = function() {
    return {
      get: get
    };
  };
  mockery.registerMock('../../core', mockedEsnConfig);
  mockery.registerMock('../esn-config', mockedEsnConfigFunction);
}

/*
 * mockedModels = {
 *   'User': function User() {
 *     ...
 *   },
 *   'Domain': function Domain() {
 *     ...
 *   }
 * }
 *
 */
function mockModels(mockedModels) {
  var types = {
    ObjectId: function(id) {
      return {id: id};
    },
    Mixed: ''
  };

  var schema = function() {};
  schema.Types = types;

  var mongooseMock = {
    Types: types,
    Schema: schema,
    model: function(model) {
      return mockedModels[model];
    },
    __replaceObjectId: function(newObjectId) {
      types.ObjectId = newObjectId;
    }
  };
  mockery.registerMock('mongoose', mongooseMock);
  return mongooseMock;
}

/*
 * stub.topics is an Array which contains every topic.
 * stub.topics[topic].data is an Array named topic and contains every published data for the 'topic' topic.
 * stub.topics[topic].handler is the handler for the 'topic' topic.
 */
function mockPubSub(path, localStub, globalStub) {
  localStub.topics = [];
  localStub.subscribe = {};
  if (!globalStub) {
    globalStub = {};
  }
  globalStub.topics = [];
  globalStub.subscribe = {};

  var mockedPubSub = {
    local: {
      topic: function(topic) {
        if (!localStub.topics[topic]) {
          localStub.topics.push(topic);
          localStub.topics[topic] = {
            data: [],
            handler: []
          };
        }

        return {
          publish: function(data) {
            var t = localStub.topics[topic];

            t.data.push(data);
            t.handler.forEach(function(handler) {
              handler(data);
            });
          },
          subscribe: function(handler) {
            localStub.topics[topic].handler.push(handler);
          },
          forward: function(pubsub, data) {
            this.publish(data);

            globalStub.topics.push(topic);
            globalStub.topics[topic] = {
              data: [],
              handler: function() {}
            };
            globalStub.topics[topic].data.push(data);
          }
        };
      }
    },
    global: {
      topic: function(topic) {
        if (!globalStub.topics[topic]) {
          globalStub.topics.push(topic);
          globalStub.topics[topic] = {
            data: [],
            handler: []
          };
        }

        return {
          publish: function(data) {
            var t = globalStub.topics[topic];

            t.data.push(data);
            t.handler.forEach(function(handler) {
              handler(data);
            });
          },
          subscribe: function(handler) {
            globalStub.topics[topic].handler.push(handler);
          }
        };
      }
    }
  };

  mockery.registerMock(path, mockedPubSub);
}

function checkAPImemberAgainstMongooseDocument(member, mongooseDoc) {
  var memberDoc = {
    _id: mongooseDoc._id.toString(),
    objectType: mongooseDoc.objectType,
    displayName: mongooseDoc.displayName,
    status: mongooseDoc.status
  };
  expect(member).to.deep.equal(memberDoc);
}

/**
 *
 * @param {object} mixin
 * @param {object} testEnv
 */
module.exports = function(mixin, testEnv) {
  mixin.mongo = {
    connect: function(callback) {
      require('mongoose').connect(testEnv.mongoUrl, callback);
    },
    disconnect: function(callback) {
      require('mongoose').disconnect(callback);
    },
    dropDatabase: function(callback) {
      MongoClient.connect(testEnv.mongoUrl, function(err, db) {
        db.dropDatabase(function(err) {
          db.close(function() {});
          callback(err);
        });
      });
    },
    clearCollection: function(collectionName, callback) {
      require('mongoose').connection.db.collection(collectionName).remove(callback);
    },
    dropCollections: function(callback) {
      require('mongoose').connection.db.collections(function(err, collections) {
        if (err) { return callback(err); }
        collections = collections.filter(function(collection) {
          return collection.collectionName !== 'system.indexes';
        });
        async.forEach(collections, function(collection, done) {
          require('mongoose').connection.db.dropCollection(collection.collectionName, done);
        }, callback);
      });
    },
    saveDoc: function(collection, doc, done) {
      MongoClient.connect(testEnv.mongoUrl, function(err, db) {
        function close(err) { db.close(function() { done(err); }); }

        if (err) { return done(err); }

        db.collection(collection).save(doc, close);
      });
    },
    /*
    *check a mongodb document
    * @param collection string - the mongodb collection to get the doc
    * @param id string|object - the doc _id (string) or the find criteria (object)
    * @param check function|object - the function that checks the doc (function). This function should return something in case of error
    *                                or the doc to check against (object)
    * @param done function - the callback. No arguments on success, error on error
    */
    checkDoc: function(collection, id, check, done) {
      MongoClient.connect(testEnv.mongoUrl, function(err, db) {

        function close(err) {
          db.close(function() {
            done(err);
          });
        }

        if (err) {
          return done(err);
        }

        if (typeof id === 'string') {
          id = {_id: id};
        }

        db.collection(collection).findOne(id, function(err, doc) {
          if (err) {
            return close(err);
          }
          expect(doc).to.exist;

          if (typeof check === 'function') {
            var checkErr = check(doc);
            if (checkErr) {
              return close(checkErr);
            }
          } else {
            doc = JSON.parse(JSON.stringify(doc));
            expect(doc).to.deep.equal(check);
          }

          close();
        });
      });
    }
  };

  mixin.mock = {
    models: mockModels,
    pubsub: mockPubSub,
    esnConfig: mockEsnConfig
  };

  mixin.requireBackend = function(path) {
    return require(testEnv.basePath + '/backend/' + path);
  };

  mixin.requireFixture = function(path) {
    return require(testEnv.fixtures + '/' + path);
  };

  mixin.httpStatusCodeValidatingJsonResponse = function(status, done) {
    return {
      json: function(s, data) {
        expect(s).to.equal(status);
        done(data);
      }
    };
  };

  /**
   * Helper function to ensure that a HttpError is provoked, either because it
   * was thrown directly or by comparing the result sent via res.json.
   *
   * The inner function is called with two parameters: res and next.  The `res`
   * parameter is a mock for an express Result object that should be passed to
   * the controller or middleware to ensure that the error is being sent. The
   * `next` parameter can be passed to controller or middleware in case it
   * should be asserted that the next function should never be called, which is
   * usually the case when an error occurs.
   *
   * The `options` parameter is an optional object with properties that should
   * be compared with the occurring error, e.g. code or details. This parameter
   * may be left out.
   *
   * @param {Function} ErrorType    One of the HttpError subclasses.
   * @param {Function} func         The inner function to call.
   * @param {Object} options        (optional) Properties to compare the error with.
   * @param {Function} done         (optional) The completion function to call.
   */
  mixin.expectHttpError = function(ErrorType, func, options, done) {
    if (typeof options === 'function') {
      done = options;
      options = {};
    }

    var res = {
      json: function(code, body) {
        clearTimeout(timer);
        expect(body.error).to.exist;
        var err = body.error;

        for (var key in (options || {})) {
          var detail = 'Expected ' + key + ' to equal ' + options[key] +
                       ', but got ' + err[key];
          expect(err[key], detail).to.equal(options[key]);
        }

        var mockError = new ErrorType('mock');
        if (!('code' in options)) {
          expect(err.code).to.equal(mockError.code);
          expect(code).to.equal(mockError.code);
        } else {
          expect(code).to.equal(options.code);
        }

        if (!('message' in options)) {
          expect(err.message).to.equal(mockError.message);
        }

        httpdomain.exit();
        if (done) {
          done();
        }
      }
    };

    var timer = setTimeout(function() {
      var detail = 'Expected ' + func + ' to cause ' + ErrorType.name;
      if (done) {
        httpdomain.exit();
        done(new Error(detail));
      } else {
        expect(false, detail).to.be.ok;
      }
    }, 10000);

    var next = function() {
      clearTimeout(timer);
      expect(false, 'Unexpectedly called next()').to.be.ok;
    };

    var errorHandler = function(e) {
      clearTimeout(timer);
      if (e instanceof chai.AssertionError ||
          e instanceof ReferenceError ||
          e instanceof TypeError) {
        throw e;
      }
      expect(e.name).to.equal(ErrorType.name);

      for (var key in (options || {})) {
        var detail = 'Expected ' + key + ' to equal ' + options[key] +
                     ', but got ' + e[key];
        expect(e[key], detail).to.equal(options[key]);
      }

      httpdomain.exit();
      if (done) {
        done();
      }
    };

    var httpdomain = domain.create();
    httpdomain.on('error', errorHandler);
    httpdomain.enter();
    try {
      func(res, next);
      httpdomain.exit();
    } catch (e) {
      errorHandler(e);
    }
  };

  /**
   * Helper that retuns an express Result object mock and ensures that the
   * given method is not called.
   *
   * @param {Function} done     The completion function.
   * @param {String} method     The method that shouldn't be called, (default: json)
   */
  mixin.expectNotCalled = function(done, method) {
    var obj = {};
    obj[method || 'json'] = function() {
      done(new Error('Unexpectedly called ' + method));
    };
  };

  mixin.checkAPImemberAgainstMongooseDocument = checkAPImemberAgainstMongooseDocument;

  mixin.callbacks = {
    noError: function(done) {
      return function(err) {
        expect(err).to.not.exist;

        done();
      };
    },
    error: function(done) {
      return function(err) {
        expect(err).to.exist;

        done();
      };
    },
    errorWithMessage: function(done, message) {
      return function(err) {
        expect(err).to.exist;
        expect(err.message).to.equals(message);

        done();
      };
    }
  };

  mixin.utils = {
    generateStringWithLength: function(length) {
      return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
  };
};
