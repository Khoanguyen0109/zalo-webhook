const express = require("express");
const router = express.Router();
var constants = require("../constants");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const { google } = require("googleapis");
const upload = require("../upload");

const credentials = require("../key/crypto-usdt-530bf5e8d3c1.json");

// Create a new JWT client with the credentials
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/drive"]
);
const drive = google.drive({ version: "v3", auth });

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
      REIL: item.REIL,
      PESO: item.PESO,
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
      currency: item.currency,
      bank: item.bank,
      account: item.account,
      account_name: item.account_name,
      status: item.status,
      qr_code: item.qr_code,
      transfer_info: item.transfer_info,
    }));
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/cost", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["extend_cost"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      currency: item.currency,
      buy_fee: item.buy_fee,
      deposit_fee: item.deposit_fee,
    }));
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
      network: item.network,
      status: item.status,
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
      account,
      bank,
      account_name,
    } = req.body;
    const id = uuidv4();
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["deposit_record"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    await sheet.addRow({
      id,
      currency,
      amount,
      wallet_address_receiver,
      name,
      phone,
      total_payment,
      network,
      account,
      bank,
      account_name,
    });
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/crypto_buy_usdt", async (req, res, next) => {
  try {
    const {
      currency,
      amount,
      mt4_mt5,
      name,
      phone,
      total_payment,
      wallet_address_trc20,
      account,
      bank,
      account_name,
    } = req.body;
    const id = uuidv4();
    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["buy_record_usdt"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rowBody = {
      id,
      currency,
      amount,
      mt4_mt5,
      wallet_address_trc20,
      name,
      phone,
      total_payment,
      account,
      bank,
      account_name,
    };
    await sheet.addRow(rowBody);
    return res.status(200).json({ status: 200, data: rowBody });
  } catch (error) {
    next(error);
  }
});

router.put("/crypto_buy_usdt/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image } = req.body;

    const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_CRYPTO,
      private_key: process.env.GOOGLE_PRIVATE_KEY_CRYPTO,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["buy_record_usdt"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    const rows = await sheet.getRows(); // can pass in { limit, offset }
    const updateRowIndex = rows.findIndex((item) => item.id === id);
    if (updateRowIndex === -1) {
      return res.status(400).json({ message: "Not found" });
    }
    rows[updateRowIndex].image = image;
    rows[updateRowIndex].save();
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
      account_name,
      to_wallet_address,
      to_wallet_network,
      name,
      mt4_mt5,
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
      account_name,
      to_wallet_address,
      to_wallet_network,
      mt4_mt5,
      name,
      phone,
      total_payment,
    });
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("image"), (req, res, next) => {
  try {
    const folderId = "1nz1bv3kdnqr5Sgy1S6iM_E8htsywstPI";

    if (!req.file) {
      return res.status("400").json({ message: "Invalid file" });
    }
    // File details
    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId],
      // Add any additional metadata you want to specify
    };

    // Read the image file
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // Upload the file to Google Drive
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) {
          console.error("Error uploading file:", err);
          res.status(500).send("Error uploading file");
          return;
        }

        console.log("File uploaded successfully. File ID:", file.data.id);

        // Delete the temporary file
        fs.unlinkSync(req.file.path);
        console.log("file", file);
        res.status(200).json({
          filePath: `https://drive.google.com/file/d/${file.data.id}/view`,
        });
        res.send("File uploaded successfully to Google Drive");
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
