const express = require("express");
const { handleErrors, addUrlParams, encryptAES } = require("./functions.js");
const app = express();
const routes = require("./routes.js");
const { encrypt, decrypt } = require("./jwt.js");
const authRouter = require("./routes/auth");
const port = 8000;

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config({ path: "../.env" });

/* Routes */
app.use("/auth", authRouter);

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { axios: axiosApi, axiosBackend } = routes;

app.get("/", (req, res) => {
	res.send("OK");
});

/* Get current user info */
app.get("/me", (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	res.status(status).send(tokenOutput);
});

/* Get user's full info */
app.get("/me/info", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		const url = routes.clerk.userInfo + tokenOutput.id;

		try {
			const response = await axiosBackend({
				url,
			});

			res.send({
				error: false,
				data: response.data,
				token: encrypt(response.data),
			});
		} catch (error) {
			const [data, statusCode] = handleErrors(error);
			res.status(statusCode).send(data);
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

app.put("/master", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		const url = routes.clerk.updateUser + tokenOutput.id;
		const { private_metadata: privData } = tokenOutput;
		privData["key"] = encryptAES(req.body.key);

		try {
			const response = await axiosBackend({
				url,
				method: "PATCH",
				data: {
					private_metadata: JSON.stringify(privData),
				},
			});

			res.send(response.data);
		} catch (error) {
			const [data, statusCode] = handleErrors(error);
			res.status(statusCode).send(data);
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

/* Save a Password */
app.post("/passwords/add", async (req, res) => {
	let { website, login, password } = req.body;
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		const passwords = tokenOutput.private_metadata.passwords ?? [];
		const url = routes.clerk.updateUser + tokenOutput.id;

		let { private_metadata } = tokenOutput;
		login = encryptAES(login);
		password = encryptAES(password);

		passwords.push({
			website,
			login,
			password,
		});

		private_metadata["passwords"] = passwords;

		try {
			const response = await axiosBackend({
				url,
				method: "PATCH",
				data: {
					private_metadata: JSON.stringify(private_metadata),
				},
			});

			res.send(response.data);
		} catch (error) {
			const [data, statusCode] = handleErrors(error);
			res.status(statusCode).send(data);
		}
	}
});

app.listen(port, () => {
	console.log("Server started!");
});
