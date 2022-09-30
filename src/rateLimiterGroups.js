const rateLimiter = require('./rateLimiter');
require('dotenv').config();


const limiterPublic = (req, res, next, weight) => {
  return rateLimiter({
    redisConfig: {
      port: process.env.REDIS_PORT,
    },
    weight,
    key: req.ip + ':' + req.url,
    limit: process.env.IP_LIMIT_PER_HOUR,
    handler: (req, res) => {
      const resetDateTime = new Date(req.rateLimit.resetTime);
      res.status(429).send(
          `Too many requests created from this IP: ${
            req.ip
          }. Next request is possible at ${resetDateTime.getHours()}:${
            (resetDateTime.getMinutes() < 10 ? '0' : '') + resetDateTime.getMinutes()
          }`,
      );
    },
    req,
    res,
    next,
  });
};
const limiterPrivate = (req, res, next, weight) => {
  return rateLimiter({
    redisConfig: {
      port: process.env.REDIS_PORT,
    },
    weight,
    key: res.token + ':' + req.url,
    limit: process.env.TOKEN_LIMIT_PER_HOUR,
    handler: (req, res) => {
      const resetDateTime = new Date(req.rateLimit.resetTime);
      res.status(429).send(
          `Too many requests created with this token. Next request is possible at ${resetDateTime.getHours()}:${
            (resetDateTime.getMinutes() < 10 ? '0' : '') + resetDateTime.getMinutes()
          }`,
      );
    },
    req,
    res,
    next,
  });
};

module.exports = {limiterPublic, limiterPrivate};
