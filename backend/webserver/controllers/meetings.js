'use strict';

/**
 * Fake controller for testing purposes
 * @param {function} dependencies
 * @return {{hello: hello}}
 */
module.exports = function(dependencies) {

  function hello(req, res) {
    res.status(200);
    res.send('Hello Meetings !');
  }

  return {
    hello: hello
  };
};

