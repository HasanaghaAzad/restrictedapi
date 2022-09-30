const moment = require('moment');
const redis = require('redis');

const rateLimiter = async ({
  redisConfig,
  weight,
  key,
  limit,
  handler,
  req,
  res,
  next,
}) => {
  const WINDOW_SIZE_IN_HOURS = 1;
  const redisClient = redis.createClient({
    url: `redis://localhost:${redisConfig.port}`,
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();

  try {
    if (!redisClient) {
      throw new Error('Redis client fail!');
    }
    const recordByKey = await redisClient.get(key);

    const currentRequestTime = moment().unix();

    if (recordByKey == null) {
      const newRecord = [
        {
          requestTimestamp: currentRequestTime,
          requestWeight: weight,
        },
      ];
      await redisClient.set(key, JSON.stringify(newRecord));

      return next();
    }

    const logsByKey = JSON.parse(recordByKey);
    const currentWindowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_HOURS, 'hours').unix();
    const requestsInCurrentWindow = logsByKey.filter((request) => {
      return request.requestTimestamp > currentWindowStartTimestamp;
    });

    req.rateLimit = {
      resetTime: requestsInCurrentWindow[0].requestTimestamp * 1000 +
  WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000,
    };
    const totalWindowRequestsCount = requestsInCurrentWindow.reduce(
        (previousWeights, current) => {
          return previousWeights + current.requestWeight;
        },
        0,
    );

    if (totalWindowRequestsCount >= limit) {
      handler(req, res);
    } else {
      logsByKey.push({
        requestTimestamp: currentRequestTime,
        requestWeight: weight,
      });
      await redisClient.set(key, JSON.stringify(logsByKey));
      next();
    }
  } catch (error) {
    next(error);
  }
};
module.exports = rateLimiter;
