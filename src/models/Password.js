const mongoose = require("mongoose");

// Define the schema for our password model
const passwordSchema = new mongoose.Schema(
	{
		type: { type: String, required: true },
		user_id: { type: String, required: true },
		url: { type: String, required: true },
		login: { type: String, required: true },
		password: { type: String, required: true },
	},
	{ timestamps: true }
);

// Export the model
module.exports = mongoose.model("Password", passwordSchema);
