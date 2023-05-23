const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { format, toDate } = require("date-fns");
const moment = require("moment-timezone");
const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  updateSheetValues,
} = require("../services/googleSheetsService");

router.post("/copy-sheet-data", async (req, res) => {
  try {
    const { spreadsheetId, rangeRead, spreadsheetIdWrite, rangeWrite } =
      req.body;

    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      auth,
      range: rangeRead,
    });
    const valueRead = response.data.values;
    updateSheetValues({
      spreadsheetId: spreadsheetIdWrite,
      auth,
      range: rangeWrite,
      values: valueRead,
    });
    console.log('valueRead', valueRead)
    return res.status(200).json({ data: response.data });
  } catch (error) {
    console.log("error", error);
  }
});

router.post("/get-sheet-data", async (req, res) => {
  try {
    const { spreadsheetId, rangeRead} =
      req.body;

    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      auth,
      range: rangeRead,
    });
    const valueRead = response.data.values;
    return res.status(200).json({valueRead});
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = router;
