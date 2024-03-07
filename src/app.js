const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { rError } = require("./utils/respones");
const dotenv = require("dotenv");

const morgan = require("morgan");
// const { webhook } = require(" './api/controller';

const myXTeam = require("./api/myX-controller");
const noiThat = require("./api/noi-that-controller");
const offline = require("./api/offline-controller");
const gps = require("./api/gps-controller");

const renderFrom = require("./api/render-form");
const custom = require("./api/custom-controller");
const booking = require("./api/booking");
const crypto = require("./api/crypto-controller");
const { default: axios } = require("axios");

global.APP = __dirname;
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

// CORS origin
app.use(cors());
app.use(morgan("dev"));

// dissable cache-control
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/api/webhook", noiThat);

// API Giai Pháp Số webhook

app.use("/api/webhook-gps", gps);
app.use("/api/webhook-offline", offline);
app.use("/myXteam", myXTeam);
app.use("/custom", custom);
app.use("/booking", booking);
app.use("/render-form", renderFrom);
app.use("/crypto", crypto);

app.get("/zalo-user", async (req, res, next) => {
  try {
    const { access_token, user_id } = req.query;
    console.log("access_token", access_token);
    const data = await axios.get("https://openapi.zalo.me/v2.0/oa/getprofile", {
      headers: {
        access_token,
      },
      params: {
        data: JSON.stringify({
          user_id,
        }),
      },
    });
    console.log("data", data);
    return res.status(200).json({ ...data.data });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.log("err", err);
  const { code } = err;

  res.status(code || 500).json(err);
});
app.listen(PORT, () => console.log(`App listening at port ${PORT}`));

module.exports = app;
