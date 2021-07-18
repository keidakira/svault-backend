const jwt = require("jsonwebtoken");
// require .env
require("dotenv").config();

// validate jwt token
exports.validateJwtToken = function (req, res, next) {
	const Bearer = req.headers.authorization?.split(" ")[0];
	if (Bearer !== "Bearer") {
		return res.status(401).send({
			message: "No token provided.",
		});
	} else {
		const token = req.headers.authorization.split(" ")[1];

		jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
			if (err) {
				return res.status(401).send({
					message: "Failed to authenticate token.",
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	}
};
