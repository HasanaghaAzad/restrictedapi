import moment from 'moment';
import {createClient} from 'redis';

const rateLimiter = async ({
  redisConfig,
  weight,
  key,
  limit,
  req,
}) => {
  const WINDOW_SIZE_IN_HOURS = 1;
  const redisClient = createClient({
    url: `redis://localhost:${redisConfig.port}`,
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  await redisClient.connect();

  if (!redisClient) {
    throw new Error('Redis client fail!');
  }
  const currentDateAndHour = moment().startOf('hour');
  const redisKey = key + ':' + currentDateAndHour;
  const recordByKey = await redisClient.get(redisKey);

  if (recordByKey == null) {
    await redisClient.set(redisKey, weight);
    return true;
  }

  const totalWindowRequestsCount = Number(recordByKey);

  if (totalWindowRequestsCount >= limit) {
    req.rateLimit = {
      resetTime: currentDateAndHour + WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000,
    };
    return false;
  } else {
    await redisClient.incrBy(redisKey, weight);
    return true;
  }
};
export default rateLimiter;
