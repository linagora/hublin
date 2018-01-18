const host = process.env.HUBLIN_REDIS_HOST || 'localhost';
const port = process.env.HUBLIN_REDIS_PORT || 6379;

module.exports = () => ({
  url: `redis://${host}:${port}`
});
