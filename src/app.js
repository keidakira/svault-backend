// import required modules
const express = require("express");
const morgan = require("morgan");

// import routes
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

var app = express();

// add middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// add routes
app.use("/auth", authRoute);
app.use("/api", userRoute);

app.listen(8000, () => {
	console.log("app listening on port 8000");
});
