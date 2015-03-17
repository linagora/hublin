'use strict';

/**
 * @return {{users: {password: string, firstname: string, lastname: string, emails: string[]}[]}}
 */
module.exports.linagora_IT = function() {

  return {
    users: [
      {
        password: 'secret',
        firstname: 'Domain ',
        lastname: 'Administrator',
        emails: ['itadmin@lng.net']
      },
      {
        password: 'secret',
        firstname: 'John',
        lastname: 'Doe',
        emails: ['jdoe@lng.net']
      },
      {
        password: 'secret',
        firstname: 'Jane',
        lastname: 'Dee',
        emails: ['jdee@lng.net']
      },
      {
        password: 'secret',
        firstname: 'Kurt',
        lastname: 'Cobain',
        emails: ['kcobain@linagora.com']
      },
      {
        password: 'secret',
        firstname: 'Jimmy',
        lastname: 'Hendrix',
        emails: ['jhendrix@linagora.com']
      },
      {
        password: 'secret',
        firstname: 'External',
        lastname: 'User1',
        emails: ['user@externalcompany1.com']
      },
      {
        password: 'secret',
        firstname: 'External',
        lastname: 'User2',
        emails: ['user@externalcompany2.com']
      }
    ],
    conferences: []
  };
};

/**
 * @return {{users: Array, conferences: {_id: string, members: {objectType: string, id: string, displayName: string}[]}[]}}
 */
module.exports.manyMembersConference = function() {
  return {
    users: [
      {
        password: 'secret',
        firstname: 'Domain ',
        lastname: 'Administrator',
        emails: ['itadmin@lng.net']
      },
      {
        password: 'secret',
        firstname: 'John',
        lastname: 'Doe',
        emails: ['jdoe@lng.net']
      },
      {
        password: 'secret',
        firstname: 'Jane',
        lastname: 'Dee',
        emails: ['jdee@lng.net']
      },
      {
        password: 'secret',
        firstname: 'Kurt',
        lastname: 'Cobain',
        emails: ['kcobain@linagora.com']
      },
      {
        password: 'secret',
        firstname: 'Jimmy',
        lastname: 'Hendrix',
        emails: ['jhendrix@linagora.com']
      },
      {
        password: 'secret',
        firstname: 'External',
        lastname: 'User1',
        emails: ['user@externalcompany1.com']
      },
      {
        password: 'secret',
        firstname: 'External',
        lastname: 'User2',
        emails: ['user@externalcompany2.com']
      }
    ],
    conferences: [
      {
        _id: 'manyMembersConf',
        members: [
        {
          password: 'secret',
          firstname: 'Kurt',
          lastname: 'Cobain',
          emails: ['kcobain@linagora.com'],
          displayName: 'Jimmy',
          connection: {},
          status: 'online',
          objectType: 'email',
          id: 'kcobain@linagora.com'
        },
        {
          password: 'secret',
          firstname: 'External',
          lastname: 'User1',
          emails: ['user@externalcompany1.com'],
          displayName: 'Extern',
          connection: {},
          status: 'offline',
          objectType: 'email',
          id: 'user@externalcompany1.com'
        },
        {
            password: 'secret',
            firstname: 'Jimmy',
            lastname: 'Hendrix',
            emails: ['jhendrix@linagora.com'],
            displayName: 'Jimmy',
            connection: {},
            status: 'online',
            objectType: 'email',
            id: 'jhendrix@linagora.com'
        },
        {
          password: 'secret',
          firstname: 'External',
          lastname: 'User2',
          emails: ['user@externalcompany2.com'],
          displayName: 'Extern2',
          connection: {},
          status: 'online',
          objectType: 'email',
          id: 'user@externalcompany2.com'
        }
        ]
      }
    ]
  };
};

module.exports.oneMemberConference = function() {
  return {
    users: [],
    conferences: [
      {
        _id: 'oneMemberConf',
        members: [{
          objectType: 'email',
          id: 'user1@linagora.com',
          displayName: 'user1'
        }]
      }
    ]
  };
};

/**
 * @return {{users: Array, conferences: {_id: string, members: {objectType: string, id: string, displayName: string}[]}[]}}
 */
module.exports.someMembersConference = function() {
  return {
    users: [],
    conferences: [
      {
        _id: 'someMembersConference',
        members: [
          {
            objectType: 'email',
            id: 'user1@linagora.com',
            displayName: 'user1'
          },
          {
            objectType: 'hublin:anonymous',
            id: '4f9787f3-723d-45ce-af57-d288803c9af1',
            displayName: 'anon'
          }
        ]
      }
    ]
  };
};


module.exports.inactiveConference = function() {
  return {
    users: [],
    conferences: [
      {
        _id: 'inactiveConference',
        members: [{
          objectType: 'email',
          id: 'user1@linagora.com',
          displayName: 'user1',
          connection: {
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
          },
          status: 'offline'
        }],
        timestamps: {
          created: new Date('2014-03-06T11:22:08.953Z')
        }
      }
    ]
  };
};
