const express = require("express");
const router = express.Router();
const { google } = require("googleapis");

const { default: axios } = require("axios");

router.get("/google-authorize", (req, res, next) => {
  try {
    const { client_id, client_secret, scopes, redirect_url } = req.query;
    console.log("redirect_url", redirect_url);

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_url
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    console.log("url", url);
    return res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});

router.get("/google-auth", async (req, res, next) => {
  try {
    const { client_id, client_secret, redirect_url, code } = req.query;

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_url
    );

    const { tokens } = await oauth2Client.getToken(code);
    console.log("tokens", tokens);

    return res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post("/renew-token", async (req, res, next) => {
  try {
    const { refresh_token, client_id, client_secret } = req.body;
    const data = await axios.post(
      "https://oauth2.googleapis.com/token",
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          client_id: client_id,
          client_secret: client_secret,
          grant_type: "refresh_token",
          refresh_token,
        },
      }
    );
    console.log("data", data);
    return res.status(200).json(data.data);
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

router.post("/sign-out", async (req, res, next) => {});

module.exports = router;
