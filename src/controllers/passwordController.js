const Password = require("../models/Password");
const passwordService = require("../services/passwordService");

exports.getAllPasswords = (req, res, next) => {
	Password.find({ user_id: req.decoded.id }, async (err, passwords) => {
		if (err) {
			res.status(500).send(err);
		} else {
			let decryptedPasswords = await passwordService.decryptPasswords(
				passwords,
				req.decoded.id
			);
			res.json(decryptedPasswords);
		}
	});
};

exports.getPasswordById = (req, res, next) => {
	Password.findById(req.params.id, async (err, password) => {
		if (err) {
			res.status(500).send(err);
		} else {
			let passwords = [password];
			let decryptedPasswords = await passwordService.decryptPasswords(
				passwords,
				req.decoded.id
			);
			res.json(decryptedPasswords[0]);
		}
	});
};

exports.savePassword = (req, res) => {
	const password = new Password({
		...req.body,
		user_id: req.decoded.id,
	});

	password
		.save()
		.then((data) => {
			res.status(200).json({
				message: "Password saved successfully",
				data,
			});
		})
		.catch((err) => {
			res.status(400).json({
				message: err.message,
			});
		});
};

exports.updatePassword = (req, res) => {
	Password.findById(req.params.id, async (err, password) => {
		if (err) {
			res.status(500).send(err);
		} else {
			password.update(req.body).then((data) => {
				res.status(200).json({
					message: "Password updated successfully",
					data: {
						...req.body,
						user_id: req.decoded.id,
					},
				});
			});
		}
	});
};

exports.deletePassword = (req, res) => {
	Password.findByIdAndRemove(req.params.id, async (err, password) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).json({
				message: "Password deleted successfully",
			});
		}
	});
};
