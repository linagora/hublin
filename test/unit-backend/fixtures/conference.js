'use strict';

var ObjectId = require('bson').ObjectId;

module.exports.inactive = function() {
  return {
      '_id' : 'test',
      'schemaVersion' : 1,
      'members' : [
          {
              'objectType' : 'hublin:anonymous',
              'id' : '1a4f0a8c-93d0-4220-9044-169fa9c24691',
              'displayName' : 'anonymous',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff0'),
              'connection' : {
                  'userAgent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
              },
              'status' : 'offline'
          }
      ],
      'history' : [],
      'timestamps' : {
          'created' : new Date('2015-02-06T11:21:53.906Z')
      },
      'createdFrom' : 'web',
      'active' : true,
      '__v' : 0
  };
};

module.exports.activeMember = function() {
  return {
      '_id' : 'test',
      'schemaVersion' : 1,
      'members' : [
          {
              'objectType' : 'hublin:anonymous',
              'id' : '1a4f0a8c-93d0-4220-9044-169fa9c24691',
              'displayName' : 'anonymous',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff0'),
              'connection' : {
                  'userAgent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
              },
              'status' : 'offline'
          },
          {
              'objectType' : 'hublin:anonymous',
              'id' : '1a4f0a8c-93d0-4220-9044-169fa9c24692',
              'displayName' : 'anonymous',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff1'),
              'connection' : {
                  'userAgent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
              },
              'status' : 'online'
          }
      ],
      'history' : [],
      'timestamps' : {
          'created' : new Date('2015-02-06T11:21:53.906Z')
      },
      'createdFrom' : 'web',
      'active' : true,
      '__v' : 0
  };
};

module.exports.garbage = function() {
  return {
      '_id' : 'test',
      'schemaVersion' : 1,
      'members' : [
          {
              'objectType' : 'hublin:anonymous',
              'id' : '1a4f0a8c-93d0-4220-9044-169fa9c24691',
              'displayName' : 'anonymous',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff0'),
              'connection' : {
                  'userAgent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
              },
              'status' : 'offline'
          },
          {
              'objectType' : 'hublin:anonymous',
              'id' : '1a4f0a8c-93d0-4220-9044-169fa9c24692',
              'displayName' : 'anonymous',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff1'),
              'connection' : {
                  'userAgent' : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
              },
              'status' : 'online'
          }
      ],
      'history' : [
        {
          'verb' : 'event',
          '_id' : new ObjectId('550031a655eb6c6e56e58ded'),
          'bto' : [],
          'to' : [],
          'inReplyTo' : [],
          'target' : [
            {
              '_id' : '1b10619a-4720-4573-8d4d-45496593f085',
              'objectType' : 'conference'
            }
          ],
          'object' : {
            '_id' : 'conference:create',
            'objectType' : 'event'
          },
          'actor' : {
            'displayName' : 'anonymous',
            '_id' : '9d4ce907-f60e-4474-83ca-617dfa3ff784',
            'objectType' : 'hublin:anonymous'
          },
          'published' : new Date('2015-02-11T12:14:30.483Z')
        }
      ],
      'timestamps' : {
          'created' : new Date('2015-02-06T11:21:53.906Z')
      },
      'createdFrom' : 'web',
      'active' : true,
      '__v' : 0
  };
};
