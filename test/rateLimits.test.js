import chai from 'chai';
import app from '../server.js';
import moment from 'moment';
import {createClient} from 'redis';

import dotenv from 'dotenv';
dotenv.config();

import chaiHttp from 'chai-http';

chai.use(chaiHttp);

const expect = chai.expect;
const requester = chai.request(app).keepOpen();
const currentDateAndHour = moment().startOf('hour');
function requestServerFewTimes(
    url,
    headers,
    repeats,
    afterEachStep,
    onFinish,
) {
  requester.get(url).set(headers).end(function(err, res) {
    afterEachStep(res);
    repeats--;
    if (repeats) {
      if (res.status === 200) {
        return requestServerFewTimes(
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
  });
}
async function delKeys(keys) {
  const redisClient = createClient({
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

    beforeEach(async () => await delKeys(['::ffff:127.0.0.1:/:'+currentDateAndHour, '::1:/:'+currentDateAndHour]));

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
            requester.get('/').end(function(err, res) {
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

    beforeEach(async () => await delKeys(token + ':/private:'+currentDateAndHour));

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
            requester.get(url)
                .set(header)
                .end((err, res) => {
                  expect(res.status).to.equal(429);
                  done();
                });
          },
      );
    });
  });
  after(()=>{
    requester.close();
  });
});
