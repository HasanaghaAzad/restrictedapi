const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const redis = require('redis');

const expect = chai.expect;

require('dotenv').config();

chai.use(chaiHttp);

const request = chai.request(server).keepOpen();

describe('Testing rate limits', () => {
  describe('GET public /', () => {
    beforeEach(async ()=> {
      const redisClient = redis.createClient({
        url: `redis://localhost:${process.env.REDIS_PORT}`,
      });
      redisClient.on('error', (err) => console.log('Redis Client Error', err));
      await redisClient.connect();
      redisClient.del('::ffff:127.0.0.1:/');
      redisClient.del('::1:/');
    });

    it(`should succeed in first ${process.env.IP_LIMIT_PER_HOUR} requests`, (done) => {
      async function requestServerFewTimes(repeat, onFinish) {
        response = await request.get('/').set({
          'content-type': 'application/json',
        });
        repeat--;
        if (repeat !== 0) {
          if (response.status==200) {
            return requestServerFewTimes(repeat, onFinish);
          }
        } else {
          expect(response.status).to.equal(200);
          onFinish();
        }
      }
      requestServerFewTimes(
          process.env.IP_LIMIT_PER_HOUR,
          () => done(),
      );
    });

    it(`should receive 429 error after ${process.env.IP_LIMIT_PER_HOUR} requests`, (done) => {
      async function afterLimitReached() {
        response = await request.get('/').set({
          'content-type': 'application/json',
        });
        expect(response.error.status).to.equal(429);
        done();
      }

      function requestServerFewTimes(repeat, onFinish) {
        request.get('/').end(() => {
          repeat--;
          if (repeat !== 0) {
            requestServerFewTimes(repeat, onFinish);
          } else {
            onFinish();
          }
        });
      }
      requestServerFewTimes(
          process.env.IP_LIMIT_PER_HOUR,
          afterLimitReached,
      );
    });
  });
  describe('GET private /private', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJ1c2VyIiwiaWF0IjoxNjY0Mzc4NDU4fQ.M5vX6XLzY-8YqFeP8YkSPPIwHmMSA_uUqm3QbQXOAYA';

    beforeEach(async ()=> {
      const redisClient = redis.createClient({
        url: `redis://localhost:${process.env.REDIS_PORT}`,
      });
      redisClient.on('error', (err) => console.log('Redis Client Error', err));
      await redisClient.connect();
      redisClient.del(token+':/private');
    });


    it(`should succeed in first ${process.env.TOKEN_LIMIT_PER_HOUR} requests`, (done) => {
      async function requestServerFewTimes(repeat, onFinish) {
        response = await request.get('/private').set({
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        });
        repeat--;
        if (repeat !== 0) {
          if (response.status==200) {
            return requestServerFewTimes(repeat, onFinish);
          }
        } else {
          expect(response.status).to.equal(200);
          onFinish();
        }
      }
      requestServerFewTimes(
          process.env.TOKEN_LIMIT_PER_HOUR,
          () => done(),
      );
    });


    it(`should receive 429 error after ${process.env.TOKEN_LIMIT_PER_HOUR} requests`, (done) => {
      async function afterLimitReached() {
        response = await request.get('/private').set({
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        });
        expect(response.error.status).to.equal(429);
        done();
      }

      function requestServerFewTimes(repeat, onFinish) {
        request
            .get('/private')
            .set({
              'content-type': 'application/json',
              'Authorization': `Bearer ${token}`,
            })
            .end(() => {
              repeat--;
              if (repeat !== 0) {
                requestServerFewTimes(repeat, onFinish);
              } else {
                onFinish();
              }
            });
      }
      requestServerFewTimes(
          process.env.TOKEN_LIMIT_PER_HOUR,
          afterLimitReached,
      );
    });
  });
});
