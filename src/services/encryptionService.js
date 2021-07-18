const CryptoJS = require("crypto-js");
require("dotenv").config();

// function to encrypt plain text to cipher text using AES and a key
exports.encrypt = (plainText, key = process.env.HASH_KEY) => {
	return CryptoJS.AES.encrypt(plainText, key).toString();
};

// function to decrypt cipher text to plain text using AES and a key
exports.decrypt = (cipherText, key = process.env.HASH_KEY) => {
	return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8);
};
