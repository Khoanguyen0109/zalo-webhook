const { google } = require("googleapis");
const sheets = google.sheets("v4");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function getSpreadSheet({ spreadsheetId, auth }) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  return res;
}

async function getSpreadSheetValues({ spreadsheetId, auth, range }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range,
  });
  return res;
}

async function updateSheetValues({ spreadsheetId, auth, range, values,rangeClear  }) {
  await sheets.spreadsheets.values.clear({
      spreadsheetId,
      auth,
      rangeClear
    });
  
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    auth,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      range,
      values
    },
  });
  return res
}

module.exports = {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  updateSheetValues
};
