'use strict';

module.exports = function(dependencies) {

  function hello(req, res) {
    res.status(200);
    res.send('Hello Meetings !');
  }

  return {
    hello: hello
  };
};

