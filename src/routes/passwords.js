const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
require("dotenv").config({ path: "../../.env" });

const {
	handleErrors,
	encryptAES,
	decryptAES,
	getPrivateData,
} = require("../functions.js");
const { decrypt } = require("../jwt.js");
const Password = require("../models/Password.js");
const { axiosSvault } = require("../routes.js");
const routes = require("../routes.js");

// connect to the database
mongoose.connect(
	process.env.MONGODB_URL,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false,
	},
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log("Mongoose connected to " + process.env.MONGODB_URL);
		}
	}
);

// check user by token header and save the password to the database
router.post("/", async (req, res) => {
	const token = req.headers.token;
	const [tokenOutput, status] = decrypt(token);
	if (status === 200) {
		const { id: userId } = tokenOutput;
		let { url, login, password: password_requested, type } = req.body;
		let key;

		// Get the private data from the axiosSvault
		await getPrivateData(token)
			.then((response) => {
				key = response.data.data.privateData.key;
			})
			.catch((err) => {
				console.log("Error");
			});

		if (key !== undefined) {
			login = encryptAES(login, key);
			password_requested = encryptAES(password_requested, key);

			const password = new Password({
				type,
				user_id: userId,
				login,
				password: password_requested,
				url,
			});

			password
				.save()
				.then((response) => {
					res.json(response);
				})
				.catch((err) => {
					res.status(400).json({ error: true, message: err.message });
				});
		} else {
			res.status(400).send({ error: true });
		}
	} else {
		res.status(status).send({ error: "Invalid token" });
	}
});

// get all passwords by user id from token header
router.get("/", (req, res) => {
	const token = req.headers.token;
	const [tokenOutput, status] = decrypt(token);
	if (status === 200) {
		const { id: userId } = tokenOutput;
		Password.find({ user_id: userId })
			.exec()
			.then((response) => {
				res.json(response);
			})
			.catch((err) => {
				res.status(400).json({ error: true, message: err.message });
			});
	} else {
		res.status(status).send({ error: "Invalid token" });
	}
});

// update a password by user id from token header
router.put("/:id", async (req, res) => {
	const token = req.headers.token;
	const [tokenOutput, status] = decrypt(token);
	if (status === 200) {
		const { id: userId } = tokenOutput;
		let { url, login, password: password_requested, type } = req.body;

		// Get the private data from the axiosSvault
		const { key } = await getPrivateData(token, res)
			.then((response) => response.data.data.privateData)
			.catch((err) => {
				return { error: true, message: err.message };
			});

		if (key !== undefined) {
			login = encryptAES(login, key);
			password_requested = encryptAES(password_requested, key);

			Password.findOneAndUpdate(
				{ _id: req.params.id, user_id: userId },
				{
					login,
					password: password_requested,
					url,
					type,
				}
			)
				.exec()
				.then((response) => {
					res.json(response);
				})
				.catch((err) => {
					res.status(400).json({ error: true, message: err.message });
				});
		} else {
			res.status(400).send({ error: true });
		}
	} else {
		res.status(status).send({ error: "Invalid token" });
	}
});

// delete a password by user id from token header
router.delete("/:id", (req, res) => {
	const token = req.headers.token;
	const [tokenOutput, status] = decrypt(token);
	if (status === 200) {
		const { id: userId } = tokenOutput;
		Password.findOneAndRemove({ _id: req.params.id, user_id: userId })
			.exec()
			.then((response) => {
				res.json(response);
			})
			.catch((err) => {
				res.status(400).json({ error: true, message: err.message });
			});
	} else {
		res.status(status).send({ error: "Invalid token" });
	}
});

module.exports = router;
