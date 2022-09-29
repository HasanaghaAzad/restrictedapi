const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("redis");
require("dotenv").config();
const client = redis.createClient({
	socket: { port: process.env.REDIS_PORT },
});
client.connect();
const limiterPublic = (weight = 1) => {
	return rateLimit({
		windowMs: 60 * 60 * 1000, // 1 hour window
		max: Math.floor(process.env.IP_LIMIT_PER_HOUR / weight),
		store: new RedisStore({
			sendCommand: (...args) => client.sendCommand(args),
		}),
		message: "Too many requests created from this IP, please try again after an hour",
		handler: (req, res) => {
			const resetDateTime = req.rateLimit.resetTime;
			res.status(429).send(
				`Too many requests created from this IP: ${
					req.ip
				}. Next request is possible at ${resetDateTime.getHours()}:${
					(resetDateTime.getMinutes() < 10 ? "0" : "") +
					resetDateTime.getMinutes()
				}`
			);
		},
		keyGenerator: (req) => req.ip + ":" + req.url,
	});
};
const limiterPrivate = (weight = 1) => {
	return rateLimit({
		windowMs: 60 * 60 * 1000, // 1 hour window
		max: Math.floor(process.env.TOKEN_LIMIT_PER_HOUR / weight),
		store: new RedisStore({
			sendCommand: (...args) => client.sendCommand(args),
		}),
		message: "Too many requests created from this token, please try again after an hour",
		handler: (req, res) => {
			const resetDateTime = req.rateLimit.resetTime;
			res.status(429).send(
				`Too many requests created with this token. Next request is possible at ${resetDateTime.getHours()}:${
					(resetDateTime.getMinutes() < 10 ? "0" : "") +
					resetDateTime.getMinutes()
				}`
			);
		},
		keyGenerator: (req, res) => res.token + ":" + req.url,
	});
};

module.exports = { limiterPublic, limiterPrivate };
