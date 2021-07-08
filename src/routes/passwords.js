const express = require("express");
const router = express.Router();
require("dotenv").config({ path: "../../.env" });

const { handleErrors, encryptAES } = require("../functions.js");
const { decrypt } = require("../jwt.js");
const routes = require("../routes.js");

const { axiosSvault, axiosDog } = routes;

// Get passwords by email id
router.get("/", async (req, res) => {
	try {
		const response = await axiosDog({
			method: "POST",
			data: JSON.stringify({
				operation: "search_by_value",
				schema: "vault",
				table: "password",
				search_attribute: "id",
				search_value: "user_1uow9IjDqTgIQd0RTzLj8g1uEwP",
				get_attributes: ["*"],
			}),
		});
		res.send(response.data);
	} catch (error) {
		console.log(error);
		res.send("Error");
	}
});

// Add a password
// TODO: Input validation, security
router.post("/add", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		// Get private_metadata which contains key to encrypt
		try {
			const tempResponse = await axiosSvault({
				url: "/me",
				headers: {
					token,
				},
			});

			let { type, details } = req.body;
			let { key } = tempResponse.data.data.privateData;

			details.login = encryptAES(details.login, key);
			details.password = encryptAES(details.password, key);

			let passwordObject = {
				type,
				details,
				id: tokenOutput.id,
			};

			try {
				const response = await axiosDog({
					method: "POST",
					data: JSON.stringify({
						operation: "insert",
						schema: "vault",
						table: "password",
						records: [passwordObject],
					}),
				});
				res.send(response.data);
			} catch (error) {
				console.log(error);
				res.send("Error");
			}
		} catch (error) {
			res.send("Error");
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

// Delete a password by
router.delete("/:id", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		const passwordHash = req.params.id;
		const userId = tokenOutput.id;

		try {
			const response = await axiosDog({
				method: "POST",
				data: JSON.stringify({
					operation: "sql",
					sql: `DELETE FROM vault.password WHERE achukubuchuku="${passwordHash}" AND id="${userId}"`,
				}),
			});

			let rows_deleted = response.data.deleted_hashes.length;

			res.send({
				error: false,
				rows_deleted,
			});
		} catch (error) {
			res.status(400).send({
				error: true,
				message: "Unable to delete user",
			});
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

module.exports = router;
