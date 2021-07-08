const express = require("express");
const router = express.Router();
require("dotenv").config({ path: "../../.env" });

const { handleErrors, addUrlParams, encryptAES } = require("../functions.js");
const { encrypt, decrypt } = require("../jwt.js");
const routes = require("../routes.js");

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { axios: axiosApi, axiosBackend } = routes;
