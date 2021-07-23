const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/vault");

mongoose.connection.on("error", () => {
	res.status(500).send("Database connection error.");
});

module.exports = mongoose;
