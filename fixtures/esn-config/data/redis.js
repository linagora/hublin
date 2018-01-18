const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;

module.exports = () => ({
  url: `redis://${host}:${port}`
});
