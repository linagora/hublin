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
    ]
  };
};
