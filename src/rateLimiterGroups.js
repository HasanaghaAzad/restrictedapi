const rateLimiter = require('./rateLimiter');
require('dotenv').config();

function applyRateLimiter(req, res, next, weight, key, limit, keySubject) {
  return rateLimiter({
    redisConfig: {
      port: process.env.REDIS_PORT,
    },
    weight,
    key,
    limit,
    handler: (req, res) => {
      const resetDateTime = new Date(req.rateLimit.resetTime);
      res.status(429).send(
          `Too many requests created from this ${keySubject}. Next request is possible at ${
            (resetDateTime.getHours() < 10 ? '0' : '') + resetDateTime.getHours()
          }:${
            (resetDateTime.getMinutes() < 10 ? '0' : '') + resetDateTime.getMinutes()
          }`,
      );
    },
    req,
    res,
    next,
  });
}

const limiterPublic = (req, res, next, weight) => {
  const key = req.ip + ':' + req.url;
  const keySubject = 'IP';
  const limit = process.env.IP_LIMIT_PER_HOUR;
  return applyRateLimiter(req, res, next, weight, key, limit, keySubject);
};
const limiterPrivate = (req, res, next, weight) => {
  const key = res.token + ':' + req.url;
  const limit = process.env.TOKEN_LIMIT_PER_HOUR;
  const keySubject = 'token';
  return applyRateLimiter(req, res, next, weight, key, limit, keySubject);
};

module.exports = {limiterPublic, limiterPrivate};
