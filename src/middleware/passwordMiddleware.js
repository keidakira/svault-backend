const userService = require("../services/userService");
const encryptionService = require("../services/encryptionService");

exports.encryptPassword = async (req, res, next) => {
	const key = await userService.getUserPrivateKey(req.decoded.id);
	const encryptedPassword = encryptionService.encrypt(req.body.password, key);

	req.body.password = encryptedPassword;
	next();
};

exports.decryptPassword = async (req, res, next) => {
	const key = await userService.getUserPrivateKey(req.decoded.id);
	const encryptedPassword = encryptionService.encrypt(req.body.password, key);

	req.body.password = encryptedPassword;
	next();
};
