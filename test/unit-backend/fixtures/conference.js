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
      'history' : [
          {
              'verb' : 'event',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff1'),
              'bto' : [],
              'to' : [],
              'inReplyTo' : [],
              'target' : [
                  {
                      '_id' : 'test',
                      'objectType' : 'conference'
                  }
              ],
              'object' : {
                  '_id' : 'conference:create',
                  'objectType' : 'event'
              },
              'actor' : {
                  'displayName' : 'anonymous',
                  '_id' : '1a4f0a8c-93d0-4220-9044-169fa9c24691',
                  'objectType' : 'hublin:anonymous'
              },
              'published' : new Date('2015-02-06T11:21:53.941Z')
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
      'history' : [
          {
              'verb' : 'event',
              '_id' : new ObjectId('54f98dd1ea5270c568cc7ff1'),
              'bto' : [],
              'to' : [],
              'inReplyTo' : [],
              'target' : [
                  {
                      '_id' : 'test',
                      'objectType' : 'conference'
                  }
              ],
              'object' : {
                  '_id' : 'conference:create',
                  'objectType' : 'event'
              },
              'actor' : {
                  'displayName' : 'anonymous',
                  '_id' : '1a4f0a8c-93d0-4220-9044-169fa9c24691',
                  'objectType' : 'hublin:anonymous'
              },
              'published' : new Date('2015-02-06T11:21:53.941Z')
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
