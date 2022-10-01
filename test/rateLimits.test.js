const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const redis = require('redis');

const expect = chai.expect;

require('dotenv').config();

chai.use(chaiHttp);

const request = chai.request(server).keepOpen();

async function requestServerFewTimes(
    url,
    headers,
    repeats,
    afterEachStep,
    onFinish,
) {
  response = await request.get(url).set(headers);
  afterEachStep(response);
  repeats--;

  if (repeats) {
    if (response.status === 200) {
      return await requestServerFewTimes(
          url,
          headers,
          repeats,
          afterEachStep,
          onFinish,
      );
    }
  } else {
    onFinish();
  }
}
async function delKeys(keys) {
  const redisClient = redis.createClient({
    url: `redis://localhost:${process.env.REDIS_PORT}`,
  });
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();
  redisClient.del(keys);
}

describe('Testing rate limits', () => {
  describe('GET public /', () => {
    const url = '/';
    const header = {};
    const limit = process.env.IP_LIMIT_PER_HOUR;

    beforeEach(async () => await delKeys(['::ffff:127.0.0.1:/', '::1:/']));

    it(`should succeed in first ${limit} requests`, (done) => {
      requestServerFewTimes(url, header, limit,
          (res) => {
            expect(res.status).to.equal(200);
          },
          () => done(),
      );
    });

    it(`should receive 429 error after ${limit} requests`, (done) => {
      requestServerFewTimes(url, header, limit,
          (res) => {
            expect(res.status).to.equal(200);
          },
          () => {
            request.get('/').end(function(err, res) {
              expect(res.status).to.equal(429);
              done();
            });
          },
      );
    });
  });
  describe('GET private /private', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJ1c2VyIiwiaWF0IjoxNjY0Mzc4NDU4fQ.M5vX6XLzY-8YqFeP8YkSPPIwHmMSA_uUqm3QbQXOAYA';

    const url = '/private';
    const header = {
      Authorization: `Bearer ${token}`,
    };
    const limit = process.env.TOKEN_LIMIT_PER_HOUR;

    beforeEach(async () => await delKeys(token + ':/private'));

    it(`should succeed in first ${limit} requests`, (done) => {
      requestServerFewTimes(
          url,
          header,
          limit,
          (res) => {
            expect(res.status).to.equal(200);
          },
          () => done(),
      );
    });

    it(`should receive 429 error after ${limit} requests`, (done) => {
      requestServerFewTimes(
          url,
          header,
          limit,
          (res) => {
            expect(res.status).to.equal(200);
          },
          () => {
            request
                .get(url)
                .set(header)
                .end((err, res) => {
                  expect(res.status).to.equal(429);
                  done();
                });
          },
      );
    });
  });
});
