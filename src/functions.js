const CryptoJS = require("crypto-js");
const { axiosSvault } = require("./routes");
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

const encryptAES = (plainText, key = process.env.HASH_KEY) => {
	const cipherText = CryptoJS.AES.encrypt(plainText, key).toString();
	return cipherText;
};

const decryptAES = (cipherText, key = process.env.HASH_KEY) => {
	const bytes = CryptoJS.AES.decrypt(cipherText, key);
	var plainText = bytes.toString(CryptoJS.enc.Utf8);

	return plainText;
};

// function to get private data from axiosSvault
const getPrivateData = async (token) => {
	return await axiosSvault({
		url: "/me",
		headers: { token: `${token}` },
	});
};

module.exports = {
	handleErrors,
	addUrlParams,
	encryptAES,
	decryptAES,
	getPrivateData,
};
