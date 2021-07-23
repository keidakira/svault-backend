const express = require("express");
const Password = require("../models/Password");
const server = require("../server");
const router = express.Router();
require("dotenv").config({ path: "../../.env" });

// Controllers
const passwordController = require("../controllers/passwordController");

// Services
const jwtService = require("../services/jwtService");

// Middlewares
const userMiddleware = require("../middleware/userMiddleware");
const passwordMiddleware = require("../middleware/passwordMiddleware");

/* Get a list of all passwords */
router.get(
	"/",
	userMiddleware.validateJwtToken,
	passwordController.getAllPasswords
);

/* Get a password */
router.get(
	"/:id",
	userMiddleware.validateJwtToken,
	passwordController.getPasswordById
);

/* Create a new password */
router.post(
	"/",
	userMiddleware.validateJwtToken,
	passwordMiddleware.encryptPassword,
	passwordController.savePassword
);

/* Update a password */
router.put(
	"/:id",
	userMiddleware.validateJwtToken,
	passwordMiddleware.encryptPassword,
	passwordController.updatePassword
);

/* Delete a password */
router.delete(
	"/:id",
	userMiddleware.validateJwtToken,
	passwordController.deletePassword
);

module.exports = router;
