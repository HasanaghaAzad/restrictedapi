let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let expect = chai.expect;

require("dotenv").config();

chai.use(chaiHttp);

const request = chai.request(server).keepOpen();

describe("Testing rate limits", () => {
	describe("GET public /", () => {
		it(`should receive 429 error after ${process.env.IP_LIMIT_PER_HOUR} requests`, (done) => {
			async function afterLimitReached() {
				response = await request.get("/").set({
					"content-type": "application/json",
				});
				expect(response.error.status).to.equal(429);
				done();
			}

			function requestServerFewTimes(repeat, onFinish) {
				request.get("/").end(() => {
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
				afterLimitReached
			);
		});
	});
	describe("GET private /private", () => {
		it(`should receive 429 error after ${process.env.TOKEN_LIMIT_PER_HOUR} requests`, (done) => {
			const token =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJ1c2VyIiwiaWF0IjoxNjY0Mzc4NDU4fQ.M5vX6XLzY-8YqFeP8YkSPPIwHmMSA_uUqm3QbQXOAYA";

			async function afterLimitReached() {
				response = await request.get("/private").set({
					"content-type": "application/json",
					Authorization: `Bearer ${token}`,
				});
				expect(response.error.status).to.equal(429);
				done();
			}

			function requestServerFewTimes(repeat, onFinish) {
				request
					.get("/private")
					.set({
						"content-type": "application/json",
						Authorization: `Bearer ${token}`,
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
				afterLimitReached
			);
		});
	});
});
