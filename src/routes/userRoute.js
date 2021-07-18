const express = require("express");
const router = express.Router();

// import user controller, middleware
const userController = require("../controllers/userController");
const userService = require("../services/userService");
const userMiddleware = require("./../middleware/userMiddleware");

// Routes
router.get("/", userMiddleware.validateJwtToken, userController.getUser);
router.get(
	"/privateKey",
	userMiddleware.validateJwtToken,
	userController.getUserPrivateKey
);
router.put(
	"/privateKey",
	userService.validatePrivateKey,
	userMiddleware.validateJwtToken,
	userController.updateUserPrivateKey
);

// export the router
module.exports = router;
