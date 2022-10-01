const rateLimiter = require('./rateLimiter');
require('dotenv').config();

async function applyRateLimiter(req, weight, key, limit) {
  return await rateLimiter({
    redisConfig: {
      port: process.env.REDIS_PORT,
    },
    weight,
    key,
    limit,
    req,
  });
}

const limiterPublic = async (req, weight) => {
  const key = req.ip + ':' + req.url;
  const limit = process.env.IP_LIMIT_PER_HOUR;
  return await applyRateLimiter(req, weight, key, limit);
};
const limiterPrivate = async (req, res, weight) => {
  const key = res.token + ':' + req.url;
  const limit = process.env.TOKEN_LIMIT_PER_HOUR;
  return await applyRateLimiter(req, weight, key, limit);
};

module.exports = {limiterPublic, limiterPrivate};
