const express = require("express");
const cors = require("cors");
const { handleErrors, addUrlParams, encryptAES } = require("./functions.js");
const app = express();
const routes = require("./routes.js");
const { encrypt, decrypt } = require("./jwt.js");
const authRouter = require("./routes/auth");
const passwordsRouter = require("./routes/passwords");
const port = 8000;

/* Middleware */
app.use(cors({ origin: "http://localhost:3000", exposedHeaders: ["Authorization"]}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config({ path: "../.env" });

/* Routes */
app.use("/auth", authRouter);
app.use("/passwords", passwordsRouter);

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { axios: axiosApi, axiosBackend } = routes;

app.get("/", (req, res) => {
	res.send("OK");
});

/* Get user's information */
app.get("/me", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		const url = routes.clerk.userInfo + tokenOutput.id;

		try {
			const response = await axiosBackend({
				url,
			});

			const { private_metadata: privateData } = response.data;

			res.send({
				error: false,
				data: { ...tokenOutput, privateData },
			});
		} catch (error) {
			const [data, statusCode] = handleErrors(error);
			res.status(statusCode).send(data);
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

/* Update master key */
app.put("/master", async (req, res) => {
	const { token } = req.headers;
	const [tokenOutput, status] = decrypt(token);

	if (status === 200) {
		// First get private data from API
		try {
			const response = await axiosBackend({
				url: routes.clerk.userInfo + tokenOutput.id,
			});

			let { private_metadata: privateData } = response.data;

			const url = routes.clerk.updateUser + tokenOutput.id;
			privateData["key"] = encryptAES(req.body.key);

			try {
				const response = await axiosBackend({
					url,
					method: "PATCH",
					data: {
						private_metadata: JSON.stringify(privateData),
					},
				});

				res.send({
					error: false,
				});
			} catch (error) {
				const [data, statusCode] = handleErrors(error);
				res.status(statusCode).send(data);
			}
		} catch (error) {
			const [data, statusCode] = handleErrors(error);
			res.status(statusCode).send({
				error: true,
				message: "Couldn't fetch user",
			});
		}
	} else {
		res.status(status).send(tokenOutput);
	}
});

app.listen(port, () => {
	console.log("Server started!");
});
