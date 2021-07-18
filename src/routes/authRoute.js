const express = require("express");
const router = express.Router();
require("dotenv").config({ path: "../../.env" });

const { handleErrors, addUrlParams, encryptAES } = require("../functions.js");
const { encrypt, decrypt } = require("../jwt.js");
const routes = require("../routes.js");

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { axios: axiosApi, axiosBackend } = routes;

/* Signin route starts */
router.post("/signin", async (req, res) => {
	const url = routes.clerk.signinUrl;

	try {
		const response = await axiosApi({
			url,
			method: "PUT",
			headers: {
				Authorization: `Bearer ${AUTH_TOKEN}`,
			},
			data: {
				identifier: req.body.identifier,
				strategy: req.body.strategy,
			},
		});

		res.setHeader("authorization", response.headers.authorization);
		res.json(response.data);
	} catch (error) {
		console.log(error);
		let [data, status] = handleErrors(error);
		res.status(status).send(data);
	}
});

/* Signin Verification Mail */
router.post("/signin_verification", async (req, res) => {
	let url = routes.clerk.signinVerificationEmailCode;
	url = addUrlParams(url, req.query);

	try {
		const response = await axiosApi({
			url,
			method: "POST",
			headers: {
				Authorization: req.headers.authorization,
			},
		});

		const fullUserData = response.data.client.sessions[0].user;
		const user = {
			id: fullUserData.id,
			firstName: fullUserData.first_name,
			lastName: fullUserData.last_name,
			profileImageUrl: fullUserData.profile_image_url,
			email: fullUserData.email_addresses.filter(
				(e) => e.id === fullUserData.primary_email_address_id
			)[0],
		};

		res.send({
			error: false,
			data: user,
			token: encrypt(user),
		});
	} catch (error) {
		const [data, status] = handleErrors(error);
		res.status(status).send(data);
	}
});

/* Signup route */
router.post("/signup", async (req, res) => {
	const { email, firstName, lastName } = req.body;

	const url = routes.clerk.signupUrl(email);

	let data,
		status = 200,
		authHeader = "";

	try {
		const response = await axiosApi(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${AUTH_TOKEN}`,
			},
			data: {
				first_name: firstName,
				last_name: lastName,
			},
		});

		data = response.data;

		authHeader = response.headers.authorization;
		res.setHeader("authorization", authHeader);

		// Now send verification mail
		const verificatonResponse = await axiosApi({
			url: routes.clerk.sendVerificatoinEmail,
			method: "POST",
			headers: {
				Authorization: authHeader,
			},
		});

		data = verificatonResponse.data;
	} catch (error) {
		[data, status] = handleErrors(error);
	}

	res.status(status).json(data);
});

/* Email verification route */
router.post("/signup_verification", async (req, res) => {
	let data, status;

	try {
		const response = await axiosApi({
			url: routes.clerk.signupVerifyEmailCode,
			method: "POST",
			data: {
				code: req.body.code,
			},
			headers: {
				Authorization: req.headers.authorization,
			},
		});

		const fullUserData = response.data.client.sessions[0].user;
		const user = {
			id: fullUserData.id,
			firstName: fullUserData.first_name,
			lastName: fullUserData.last_name,
			profileImageUrl: fullUserData.profile_image_url,
			email: fullUserData.email_addresses.filter(
				(e) => e.id === fullUserData.primary_email_address_id
			)[0],
		};

		data = {
			error: false,
			data: user,
			token: encrypt(user),
		};
		status = 200;
	} catch (e) {
		[data, status] = handleErrors(e);
	}

	res.status(status).json(data);
});

module.exports = router;
