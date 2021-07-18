exports.validatePrivateKey = function (req, res, next) {
	var privateKey = req.body.key;
	var privateKeyPattern =
		/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
	if (!privateKeyPattern.test(privateKey)) {
		return res.status(400).send({
			message: "Invalid private key",
		});
	}
	next();
};
