const CryptoJS = require("crypto-js");
require("dotenv").config({ path: "../.env" });

const handleErrors = (errorObject) => {
	let error = errorObject,
		data,
		status;

	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		data = error.response.data;
		status = error.response.status;
	} else if (error.request) {
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js
		data = error.request;
		status = 400;
	} else {
		// Something happened in setting up the request that triggered an Error
		data = {
			error: true,
			message: error.message,
		};
		status = 400;
	}

	return [data, status];
};

const addUrlParams = (url, obj) => {
	url += "?";
	Object.entries(obj).forEach(([key, value]) => {
		url += `${key}=${value}&`;
	});

	return url.slice(0, -1);
};

const encryptAES = (plainText) => {
	const cipherText = CryptoJS.AES.encrypt(
		plainText,
		process.env.HASH_KEY
	).toString();
	return cipherText;
};

const decryptAES = (cipherText) => {
	const bytes = CryptoJS.AES.decrypt(cipherText, process.env.HASH_KEY);
	var plainText = bytes.toString(CryptoJS.enc.Utf8);

	return plainText;
};

module.exports = {
	handleErrors,
	addUrlParams,
	encryptAES,
	decryptAES,
};
