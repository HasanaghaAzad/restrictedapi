const express = require("express");
const { limiterPublic, limiterPrivate } = require("./src/rateLimiters.js");

require("dotenv").config();
const PORT = process.env.PORT || 7777;

const auth = require("./middleware/auth");

const app = express();
app.use(express.json());

app.get("/", limiterPublic(), (req, res) => {
	res.status(200).send("Welcome to the public page");
});

app.get("/2", limiterPublic(2), (req, res) => {
	res.status(200).send("Welcome to the public page");
});
app.get("/3", limiterPublic(3), (req, res) => {
	res.status(200).send("Welcome to the public page");
});
app.get("/4", limiterPublic(4), (req, res) => {
	res.status(200).send("Welcome to the public page");
});
app.get("/5", limiterPublic(5), (req, res) => {
	res.status(200).send("Welcome to the public page");
});

app.get("/private", auth, limiterPrivate(), (req, res) => {
	res.status(200).send("Welcome to the private page");
});

const start = () => {
	try {
		app.listen(PORT, () => {
			console.log(`App running on port ${PORT}`);
		});
	} catch (error) {
		console.log(error);
	}
};

start();

module.exports = app;
