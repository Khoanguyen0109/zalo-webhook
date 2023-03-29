const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { rError } = require("./utils/respones");
const dotenv = require("dotenv");
const moment = require("moment-timezone");

const morgan = require("morgan");
// const { webhook } = require(" './api/controller';
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { format, toDate } = require("date-fns");
const myXTeam = require("./api/myX-controller");
const noiThat = require("./api/noi-that-controller");
const gps = require("./api/gps-controller");

global.APP = __dirname;
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS origin
app.use(cors());
app.use(morgan("dev"));

// dissable cache-control
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/api/webhook", noiThat);

// API Giai Pháp Số webhook

app.use("/api/webhook-gps", gps);
app.use("/myXteam", myXTeam);
app.use((err, req, res, next) => {
  const { message, code, subcode, errorItems, error } = err;

  return rError(
    res,
    code || 500,
    {
      message: message || "Something went wrong!",
      subcode,
      errorItems,
    },
    error
  );
});
app.listen(PORT, () => console.log(`App listening at port ${PORT}`));

module.exports = app;
