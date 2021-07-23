const routes = require("../routes");
const { axiosBackend } = routes;

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

exports.getUserPrivateKey = async (user_id) => {
	const response = await axiosBackend({
		url: "/v1/users/" + user_id,
	});

	// extract private key from response
	const { key } = response.data.private_metadata;

	return key;
};
