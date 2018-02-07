(function(angular) {
  'use strict';

  angular.module('op.live-conference')
    .factory('ConferenceState', ConferenceState);

  function ConferenceState($rootScope, LOCAL_VIDEO_ID, REMOTE_VIDEO_IDS, newImage) {
    /*
    * Store a snapshot of current conference status and an array of attendees describing
    * current visible attendees of the conference by their index as position.
    * attendees : [{
    *   videoId:
    *   id:
    *   rtcid:
    *   displayName:
    *   avatar:
    * }]
    */
    function ConferenceState(conference) {
      this.conference = conference;
      this.attendees = [];
      this.localVideoId = LOCAL_VIDEO_ID;
      this.videoIds = [LOCAL_VIDEO_ID].concat(REMOTE_VIDEO_IDS);
      this.videoElements = this.videoIds.map(function(id) { return angular.element('<video id="' + id + '" autoplay="autoplay" style="display:none;"/>'); });
      this.avatarCache = [];
    }

    ConferenceState.prototype.getAttendeeByRtcid = function(rtcid) {
      return this.attendees.filter(function(attendee) {
          return attendee && attendee.rtcid === rtcid;
        })[0] || null;
    };

    ConferenceState.prototype.getAttendeeByVideoId = function(videoId) {
      return this.attendees.filter(function(attendee) {
          return attendee && attendee.videoId === videoId;
        })[0] || null;
    };

    function updateAttendee(attendee, properties) {
      if (!attendee) {
        return;
      }

      var oldProperties = {
        speaking: attendee.speaking,
        mute: attendee.mute,
        muteVideo: attendee.muteVideo,
        localmute: attendee.localmute
      };

      Object.keys(properties).forEach(function(property) {
        attendee[property] = properties[property];
      });

      $rootScope.$applyAsync();
      $rootScope.$broadcast('conferencestate:attendees:update', attendee);

      Object.keys(oldProperties).forEach(function(property) {
        if (oldProperties[property] !== attendee[property]) {
          $rootScope.$broadcast('conferencestate:' + property, (function(o) { o[property] = attendee[property]; return o; })({ id: attendee.rtcid }));
        }
      });
    }

    ConferenceState.prototype.updateAttendeeByIndex = function(index, properties) {
      updateAttendee(this.attendees[index], properties);
    };

    ConferenceState.prototype.updateAttendeeByRtcid = function(rtcid, properties) {
      updateAttendee(this.getAttendeeByRtcid(rtcid), properties);
    };

    ConferenceState.prototype.pushAttendee = function(index, rtcid, id, displayName) {
      var attendee = {
        index: index,
        videoId: this.videoIds[index],
        id: id,
        rtcid: rtcid,
        displayName: displayName,
        // This needs to be served by the webapp embedding angular-liveconference
        avatar: '/images/avatar/default.png',
        localmute: false
      };
      this.attendees[index] = attendee;
      $rootScope.$broadcast('conferencestate:attendees:push', attendee);
    };

    ConferenceState.prototype.removeAttendee = function(index) {
      var attendee = this.attendees[index];
      this.attendees[index] = null;
      this.avatarCache[index] = null;
      $rootScope.$broadcast('conferencestate:attendees:remove', attendee);
    };

    ConferenceState.prototype.updateLocalVideoId = function(videoId) {
      this.localVideoId = videoId;
      $rootScope.$broadcast('conferencestate:localVideoId:update', this.localVideoId);
    };

    ConferenceState.prototype.updateLocalVideoIdToIndex = function(index) {
      this.localVideoId = this.videoIds[index];
      $rootScope.$broadcast('conferencestate:localVideoId:update', this.localVideoId);
    };

    ConferenceState.prototype.updateSpeaking = function(rtcid, speaking) {
      this.updateAttendeeByRtcid(rtcid, { speaking: speaking });
    };

    ConferenceState.prototype.updateMuteFromIndex = function(index, mute) {
      this.updateAttendeeByIndex(index, { mute: mute });
    };

    ConferenceState.prototype.updateMuteFromRtcid = function(rtcid, mute) {
      this.updateAttendeeByRtcid(rtcid, { mute: mute });
    };

    ConferenceState.prototype.updateMuteVideoFromIndex = function(index, mute) {
      this.updateAttendeeByIndex(index, { muteVideo: mute });
    };

    ConferenceState.prototype.updateTimezoneOffsetFromIndex = function(index, timezoneOffset) {
      this.updateAttendeeByIndex(index, { timezoneOffset: timezoneOffset });
    };

    ConferenceState.prototype.updateMuteVideoFromRtcid = function(rtcid, mute) {
      this.updateAttendeeByRtcid(rtcid, { muteVideo: mute });
    };

    ConferenceState.prototype.getAvatarImageByIndex = function(index, callback) {
      var attendee = this.attendees[index];

      if (!attendee) {
        return callback(new Error('No attendee at index ' + index));
      }

      if (!this.avatarCache[index]) {
        var self = this;

        this.avatarCache[index] = newImage();
        this.avatarCache[index].src = attendee.avatar;
        this.avatarCache[index].onload = function() {
          callback(null, self.avatarCache[index]);
        };
      } else {
        callback(null, this.avatarCache[index]);
      }
    };

    ConferenceState.prototype.updateLocalMuteFromRtcid = function(rtcid, mute) {
      this.updateAttendeeByRtcid(rtcid, {localmute: mute});
    };

    ConferenceState.prototype.getAttendees = function() {
      return angular.copy(this.attendees);
    };

    ConferenceState.prototype.getVideoElementById = function(id) {
      return this.videoElements[this.videoIds.indexOf(id)];
    };

    return ConferenceState;
  }
})(angular);
