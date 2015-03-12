'use strict';

module.exports = function(dependencies) {

  var logger = dependencies('logger'),
      mailer = dependencies('mailer');

  function sendFeedbackMail(req, res) {
    mailer.mailconfig(function(err, data) {
      if (err) {
        return internalServerError(res, err.message);
      }

      if (!data.feedback || !data.feedback.rcpt) {
        return internalServerError(res, 'feedback.rcpt is required in the mail configuration');
      }

      mailer.send(req.body.email, data.feedback.rcpt, 'Hubl.in | Feedback from ' + req.body.name, req.body.text, function(err, response) {
        if (err) {
          return internalServerError(res, err.message);
        }

        return res.json(200, response);
      });
    });
  }

  function internalServerError(res, message) {
    logger.error('Cannot send feedback email: ', message);

    return res.json(500, {
      error: {
        code: 500,
        message: 'Internal Server Error',
        details: message
      }
    });
  }

  return {
    sendFeedbackMail: sendFeedbackMail
  };
};

