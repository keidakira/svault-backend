const axios = require("axios");
require("dotenv").config();

const routes = {
  axios: axios.create({
    baseURL: process.env.BASE_URL
  }),
  axiosBackend: axios.create({
    baseURL: process.env.BACKEND_BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.AUTH_TOKEN}`
    }
  }),
  clerk: {
    signupUrl(email) {
      return "/v1/client/sign_up_attempt?email_address=" + email;
    },
    sendVerificatoinEmail:
      "/v1/client/sign_up_attempt/email_address/send_verification_email",
    signupVerifyEmailCode: "/v1/client/sign_up_attempt/email_address/verify",
    signinUrl: "/v1/client/sign_in_attempt",
    signinVerificationEmailCode:
      "/v1/client/sign_in_attempt/attempt_factor_one",
    userInfo: "/v1/users/",
    updateUser: "/v1/users/"
  }
};

module.exports = routes;
