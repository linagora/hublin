'use strict';

module.exports = function(dependencies) {

  var errors = require('../errors')(dependencies),
      mailer = dependencies('mailer');

  function sendFeedbackMail(req, res) {
    mailer.mailconfig(function(err, data) {
      if (err) {
        throw new errors.ServerError(err);
      }

      if (!data.feedback || !data.feedback.rcpt) {
        throw new errors.ServerError('feedback.rcpt is required in the mail configuration');
      }

      mailer.send(req.body.email, data.feedback.rcpt, 'Hubl.in | Feedback from ' + req.body.name, req.body.text, function(err, response) {
        if (err) {
          throw new errors.ServerError(err);
        }

        return res.json(200, response);
      });
    });
  }

  return {
    sendFeedbackMail: sendFeedbackMail
  };
};

