// required imports
const routes = require("../routes");
const { axiosBackend } = routes;

// Services
const encryptionService = require("../services/encryptionService");
const userService = require("../services/userService");

// Model
const Password = require("../models/password");

exports.getUser = async (req, res, next) => {
	const response = await axiosBackend({
		url: "/v1/users/" + req.decoded.id,
	});

	res.send(response.data);
};

exports.getUserPrivateKey = async (req, res, next) => {
	const key = await userService.getUserPrivateKey(req.decoded.id);

	res.send({
		key,
	});
};

exports.updateUserPrivateKey = async (req, res, next) => {
	const key = encryptionService.encrypt(req.body.key);
	const oldKey = await userService.getUserPrivateKey(req.decoded.id);

	try {
		const response = await axiosBackend({
			url: "/v1/users/" + req.decoded.id,
			method: "PATCH",
			data: {
				private_metadata: JSON.stringify({ key }),
			},
		});

		// Get all passwords of the user and upadate them
		let passwords = await Password.find({ user_id: req.decoded.id });

		passwords = passwords.map((password) => {
			let oldPassword = encryptionService.decrypt(
				password.password,
				oldKey
			);

			password.password = encryptionService.encrypt(oldPassword, key);

			return password;
		});

		passwords.forEach(async (password) => {
			let updated = await Password.update(
				{ _id: password._id },
				password
			);
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
