require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
	const bearerHeader = req.headers["authorization"];

	if (!bearerHeader) {
		return res.status(401).json({
			message: "You need to have a token to access this resource",
		});
	}
	const bearer = bearerHeader.split(" ");
	const bearerToken = bearer[1];

	try {
		jwt.verify(bearerToken, JWT_SECRET);
		res.token = bearerToken;
	} catch (err) {
		return res.status(401).send("Invalid Token");
	}

	return next();
}

module.exports = verifyToken;
