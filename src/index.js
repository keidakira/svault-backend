const express = require("express");
const { handleErrors, addUrlParams, encryptAES } = require("./functions.js");
const app = express();
const routes = require("./routes.js");
const { encrypt, decrypt } = require("./jwt.js");
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const { axios: axiosApi, axiosBackend } = routes;

app.get("/", (req, res) => {
  res.send("OK");
});

/* Signin route starts */
app.post("/signin", async (req, res) => {
  const url = routes.clerk.signinUrl;

  try {
    const response = await axiosApi({
      url,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      },
      data: {
        identifier: req.body.identifier,
        strategy: req.body.strategy
      }
    });

    res.setHeader("authorization", response.headers.authorization);
    res.json(response.data);
  } catch (error) {
    let [data, status] = handleErrors(error);
    res.status(status).send(data);
  }
});

/* Signin Verification Mail */
app.post("/signin_verification", async (req, res) => {
  let url = routes.clerk.signinVerificationEmailCode;
  url = addUrlParams(url, req.query);

  try {
    const response = await axiosApi({
      url,
      method: "POST",
      headers: {
        Authorization: req.headers.authorization
      }
    });

    const user = response.data.client.sessions[0].user;

    res.send({
      error: false,
      data: user,
      token: encrypt(user)
    });
  } catch (error) {
    const [data, status] = handleErrors(error);
    res.status(status).send(data);
  }
});

/* Signup route */
app.post("/signup", async (req, res) => {
  const { email, firstName, lastName } = req.body;

  const url = routes.clerk.signupUrl(email);

  let data,
    status = 200,
    authHeader = "";

  try {
    const response = await axiosApi(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      },
      data: {
        first_name: firstName,
        last_name: lastName
      }
    });

    data = response.data;

    authHeader = response.headers.authorization;
    res.setHeader("authorization", authHeader);

    // Now send verification mail
    const verificatonResponse = await axiosApi({
      url: routes.clerk.sendVerificatoinEmail,
      method: "POST",
      headers: {
        Authorization: authHeader
      }
    });

    data = verificatonResponse.data;
  } catch (error) {
    [data, status] = handleErrors(error);
  }

  res.status(status).json(data);
});

/* Email verification route */
app.post("/signup_verification", async (req, res) => {
  let data, status;

  try {
    const response = await axiosApi({
      url: routes.clerk.verifyEmailCode,
      method: "POST",
      formData: {
        code: req.body.code
      },
      headers: {
        Authorization: req.headers.authorization
      }
    });
    data = response.data;
    status = 200;
  } catch (e) {
    [data, status] = handleErrors(e);
  }

  res.status(status).json(data);
});

/* Get current user info */
app.get("/me", (req, res) => {
  const { token } = req.headers;
  const [tokenOutput, status] = decrypt(token);

  res.status(status).send(tokenOutput);
});

/* Get user's full info */
app.get("/me/info", async (req, res) => {
  const { token } = req.headers;
  const [tokenOutput, status] = decrypt(token);

  if (status === 200) {
    const url = routes.clerk.userInfo + tokenOutput.id;

    try {
      const response = await axiosBackend({
        url
      });

      res.send({
        error: false,
        data: response.data,
        token: encrypt(response.data)
      });
    } catch (error) {
      const [data, statusCode] = handleErrors(error);
      res.status(statusCode).send(data);
    }
  } else {
    res.status(status).send(tokenOutput);
  }
});

app.put("/master", async (req, res) => {
  const { token } = req.headers;
  const [tokenOutput, status] = decrypt(token);

  if (status === 200) {
    const url = routes.clerk.updateUser + tokenOutput.id;
    const { private_metadata: privData } = tokenOutput;
    privData["key"] = encryptAES(req.body.key);

    try {
      const response = await axiosBackend({
        url,
        method: "PATCH",
        data: {
          private_metadata: JSON.stringify(privData)
        }
      });

      res.send(response.data);
    } catch (error) {
      const [data, statusCode] = handleErrors(error);
      res.status(statusCode).send(data);
    }
  } else {
    res.status(status).send(tokenOutput);
  }
});

app.listen(port, () => {
  console.log("Server started!");
});
