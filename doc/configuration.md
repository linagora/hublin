# Configuration

- Local configuration can be updated in the 'config' folder
- Global configuration (shared between nodes), can be updated in the 'configuration' collection in the MongoDB database

## Mail

  To configure the mail feature, you need to create a document in the mongo collection configuration, as below:

```javascript
  {
    "_id" : "mail",
    "mail" : {
        "noreply" : "noreply@yourserver.com"
    },
    "transport" : {
        "type" : "SMTP",
        "config" : {
            "host" : "smtp.yourserver.com",
            "secureConnection" : false,
            "port" : 25
        }
    },
    "feedback" : {
        "rcpt" : [
            "hublin@yourserver.com"
        ]
    }
  }
```

  "smtp.yourserver.com" must be replaced by an actual SMTP server that you have access to, optionally defining an authentication if required by the SMTP server.
  hubl.in is actually using nodemailer to send emails, you'll find all possible confifuration settings on the project page at https://github.com/andris9/nodemailer-smtp-transport.

## i18n

You can configure what default language hubl.in will use, when the client browser requests an unsupported language. To do this, create a new document in the mongo **configuration** collection, as below:

```javascript
{
  _id: 'i18n',
  defaultLocale: 'en'
}
```

## webserver URL

Hubl.in allows sending invites using an email. In such cases, the system will try to detect the server URL using client HTTP headers. However, you can force the URL of your hubl.in instance by creating a web document in the configuration collection. The document looks like this:

```javascript
{
  _id: 'web',
  base_url: 'https://your.domain.com/'
}
```

## Local configuration

### Loggers

Loggers can be configured in the config/default.*.json file:

- In the loggers array: Configure the core logger.
- In the loggers array of the webserver: Configure the webserver layer logger.

Note: Loggers are following the [Winston](https://github.com/winstonjs/winston) logger format.

A logger must have a name and a hash of options to use.

```
    {
      "name": "File",
      "enabled": true,
      "options": {
        "filename": "./log/application.log",
        "level": "info",
        "handleExceptions": true,
        "json": false,
        "prettyPrint": true,
        "colorize": false
      }
    }
```

A logger can be enabled or not (a logger added to the array without the enabled flag will not be active).

Winston allows to use external 'transports'. In order to use it, you must:

1. Install it locally using 'npm install'
2. Add it to the array
3. Define which is the module to be loaded to use this transport by setting the 'module' value
4. Use the right name. The name is used to build the function to be used as transport.

For example, if you want to use the [Mail Transport](https://github.com/winstonjs/winston#mail-transport), you will have to define it in the configuration like:

```
    {
      "name": "Mail",
      "enabled": "true",
      "module": "winston-mail",
      "options": {
        "to": "fail@hubl.in",
        "host": "smtp@hubl.in",
        "port": 587,
        "username": "admin",
        "password": "secret",
        "ssl": {
          "key": "",
          "ca": "",
          "cert": ""
        },
        "level": "error",
        "silent": true
      }
    }
```

Based on this configuration, Hubl.in will build the transport to add to Winston instance like:

    var mail = require('winston-mail');
    var Transports = mail[logger.name];

    # Which is equivalent to
    var Mail = require('winston-mail').Mail;
