const janusHost = process.env.HUBLIN_JANUS_HOST || 'localhost';
const janusPort = process.env.HUBLIN_JANUS_PORT || 8088;

module.exports = () => ({
  configuration: [
    {
      type: 'janus',
      url: `http://${janusHost}:${janusPort}`
    }
  ]
});
