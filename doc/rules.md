# Developer Rules

## Logger

### Message Format

The logger must be called using message interpolation:

    var name = 'Bruce Lee';
    //...
    logger.info('User %s is connected', name);

When logging an error, add it as message metadata (last argument):

    module.connect(user, function(err) {
      if (err) {
        logger.error('User %s can not connect', user, err);
      }
    });

When logging a Mongoose object, call toObject() on it to have clean logs without Mongoose functions:

    Conference.findById(id, function(err, conference) {
      //...
      logger.debug('Got the conference', conference.toObject());
    });

