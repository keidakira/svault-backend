// required imports
const routes = require("../routes");
const { axiosBackend } = routes;
const encryptionService = require("../services/encryptionService");

exports.getUser = async (req, res, next) => {
	const response = await axiosBackend({
		url: "/v1/users/" + req.decoded.id,
	});

	res.send(response.data);
};

exports.getUserPrivateKey = async (req, res, next) => {
	const response = await axiosBackend({
		url: "/v1/users/" + req.decoded.id,
	});

	// extract private key from response
	const { key } = response.data.private_metadata;

	res.send({
		key,
	});
};

exports.updateUserPrivateKey = async (req, res, next) => {
	const key = encryptionService.encrypt(req.body.key);

	try {
		const response = await axiosBackend({
			url: "/v1/users/" + req.decoded.id,
			method: "PATCH",
			data: {
				private_metadata: JSON.stringify({ key }),
			},
		});

		res.send({
			error: false,
			message: "Private key updated",
		});
	} catch (error) {
		console.log(error);
		res.send("Error");
	}
};
