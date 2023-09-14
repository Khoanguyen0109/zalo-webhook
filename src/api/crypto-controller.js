const express = require("express");
const router = express.Router();
var constants = require("../constants");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { v4: uuidv4 } = require("uuid");

router.get("/currency-exchange", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["exchange_rate"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      USD: item.USD,
      VND: item.VND,
      KHR: item.KHR,
      PHP: item.PHP,
    }));
    console.log("rows", rows);
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/bank-account", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["info_bank_account"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      bank: item.bank,
      account: item.account,
      account_name: item.account_name,
      limit: item.limit,
      transfer_info: item.transfer_info,
    }));
    console.log("rows", rows);
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/wallet", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["info_crypto_wallet"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      wallet_address: item.wallet_address,
      limit: item.limit,
    }));
    console.log("rows", rows);
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.post("/crypto_buy", async (req, res, next) => {
  try {
    const {
      currency,
      amount,
      wallet_address_receiver,
      name,
      phone,
      total_payment,
      network,
    } = req.body;
    const id = uuidv4();
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["buy_record"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    await sheet.addRow({
      id,
      currency,
      amount,
      wallet_address_receiver,
      name,
      phone,
      total_payment,
      network,
    });
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/crypto_sell", async (req, res, next) => {
  try {
    const id = uuidv4();
    const {
      currency,
      amount,
      bank,
      account,
      to_wallet_address,
      name,
      phone,
      total_payment,
    } = req.body;
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["sell_record"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    await sheet.addRow({
      id,
      currency,
      amount,
      bank,
      account,
      to_wallet_address,
      name,
      phone,
      total_payment,
    });
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
