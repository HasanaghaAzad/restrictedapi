import auth from './auth.js';
import rateLimiterGroups from '../src/rateLimiterGroups.js';
const {limiterPublic, limiterPrivate} = rateLimiterGroups;


function setRouting({weight, access, title}) {
  return async function(req, res, next) {
    let result = false;
    let keySubject = 'IP';
    if (access==='public') {
      result = await limiterPublic(req, weight);
    } else {
      try {
        auth(req, res);
        result = await limiterPrivate(req, res, weight);
        keySubject = 'token';
      } catch (err) {
        res.status(401).send(err.message);
        return next();
      }
    }
    if (result) {
      res.status(200).send(`Welcome to the ${title} page.`);
    } else {
      const resetDateTime = new Date(req.rateLimit.resetTime);
      res.status(429).send(
          `Too many requests created from this ${keySubject}. Next request is possible at ${
            (resetDateTime.getHours() < 10 ? '0' : '') + resetDateTime.getHours()
          }:${
            (resetDateTime.getMinutes() < 10 ? '0' : '') + resetDateTime.getMinutes()
          }`,
      );
    }
    next();
  };
}
export default setRouting;
