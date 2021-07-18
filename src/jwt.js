require("dotenv").config();
const privateKey = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const encrypt = (jsonObject) => {
	const token = jwt.sign(jsonObject, privateKey);
	return token;
};

const decrypt = (token) => {
	try {
		const jsonObject = jwt.verify(token, privateKey);
		return [jsonObject, 200];
	} catch (error) {
		return [error, 400];
	}
};

module.exports = {
	encrypt,
	decrypt,
};
