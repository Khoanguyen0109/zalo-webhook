const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { format, toDate } = require("date-fns");
const moment = require("moment-timezone");

router.post("/copy-sheet-data", async (req, res) => {
  try {
    const { spreadSheetId, sheetName, rowStart, limit } = req.body;
    const doc = new GoogleSpreadsheet(spreadSheetId);
    console.log('rowStart', rowStart)
    await doc.useServiceAccountAuth({
      //   client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CUSTOM,
      //   private_key: process.env.GOOGLE_PRIVATE_KEY_CUSTOM,
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle[sheetName]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const data = [];
    await( await sheet.getRows({
      offset: rowStart,
      limit: limit ?? 10,
    })).map(item => data.push(item._rawData));

    return res.status(200).json({ data: data });
  } catch (error) {
    console.log('error', error)
    res.sendStatus(500)

  }
});

module.exports = router;
