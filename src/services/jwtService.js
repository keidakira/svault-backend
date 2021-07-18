const jwt = require("jsonwebtoken");
require("dotenv").config();

// function called generateToken to generate token
exports.generateToken = (payload) => {
	var token = jwt.sign(payload, process.env.JWT_SECRET);
	return token;
};

// function called verifyToken to verify token
exports.verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};
