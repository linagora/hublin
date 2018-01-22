const extend = require('extend');
const ICE_SERVERS = 'iceservers';

module.exports = dependencies => {
  const logger = dependencies('logger');
  const config = require('../../core/esn-config');

  return {
    denormalize,
    sanitizeMembers,
    sanitizeMember,
    sanitizeAndValidateMember
  };

  function denormalize(conference) {
    var sanitized = sanitizeConference(conference);

    return pushIceConfiguration(sanitized);
  }

  function sanitizeAndValidateMember(member) {
    if (!member.objectType || !member.id) {
      return false;
    }

    return {
      objectType: member.objectType,
      id: member.id,
      displayName: member.displayName ? member.displayName : member.id
    };
  }

  function sanitizeMember(member) {
    return {
      objectType: member.objectType,
      _id: member._id,
      displayName: member.displayName,
      status: member.status
    };
  }

  function sanitizeMembers(members) {
    return members.map(sanitizeMember);
  }

  function sanitizeConference(conference) {
    var sanitizedConference = extend(true, {}, conference);

    delete sanitizedConference.history;
    if (conference.members) {
      sanitizedConference.members = sanitizeMembers(sanitizedConference.members);
    }

    return sanitizedConference;
  }

  function pushIceConfiguration(conference) {
    return new Promise(resolve => {
      config(ICE_SERVERS).get((err, iceServers) => {
        if (err || !iceServers) {
          logger.info('Ice servers are not configured, using default ones', err || iceServers);
        }

        if (iceServers && iceServers.servers) {
          conference.iceServers = iceServers.servers;
        }

        resolve(conference);
      });
    });
  }
};
