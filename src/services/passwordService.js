const userService = require("../services/userService");
const encryptionService = require("../services/encryptionService");

exports.decryptPasswords = async (passwords, user_id) => {
	const key = await userService.getUserPrivateKey(user_id);

	return passwords.map((password) => {
		password.password = encryptionService.decrypt(password.password, key);
		return password;
	});
};
