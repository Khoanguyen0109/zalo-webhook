const { default: axios } = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
var constants = require("../../constants");

const EXCHANGE_CURRENCY_API_KEY = "21eb728d1acc21733b6fffe6";
const PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEon4UN6CgbZ+h\nKaFhUYqDEO1lYVrhqwcOYK7u+aBoHhmY4cRNw7K/rFOhp0GCGV72e9qeuEHnf7yy\nEIelJc2zTSzPAAeUpFgnL21vjCt19YFoTjjMzMfrlMvZsba9Z32XLyg9hvfbFk4i\nXQP8hla2Gqr36WlrZ126EMUEa9WEClF5cbSt91EXODGp0WNQyz8BMUfwgV9hI9k4\nM2j/lzdLLmHu4+otU2obIkoWbWmlntvHOrTK7GaICg3nIIxNJOKFdewQQJKKiTiH\nK35aeo76tASwcVJtOhI21qskmdhnoXkOLd53sF9sx7v1oRroLXqnezgxMVQZmGUE\n0ApRAoVxAgMBAAECggEARzledr9BgOrET/GO4XvSMrBedQLjEuvKtgQCSVCFMEF6\n3xwj6VER/YiTkHHPcirzcU+ifCxcvthPhqYjJAhB7ojtSpuFo2s1/ReaSbXZhjQj\nqB7xRwmD/sqaXiOXgBqs7KapqkOpoqN9MMhFaeJVJUgalorm4v8BfaSWYIgYwmcB\nVaIKjVYGA97GfL61/DFq8+6PMWsZANrYb8FceViDZM9ZG/WfUnFe6G2Dhsiuoykk\nNmjIhesCVZ8ADnMiJCnVeM2rb6b4Zc76ev8qzICh9xZKPlUoMCnQLO6pmYkMm7aS\ny7V+uXYvd8bogmHrltqb7pLqXPKcFFStt97VOpK8QwKBgQDzFtKZ9eNKotiAU0Fb\nrJNUhmo5AWq/m8I59SeIEXirWwsEYXuVJFFf4ZusC/3yE5s73L/6xgC6Uritg0sJ\njzOp4xC/tN6YFxPoU1pENUor2Vuj3Ld/V4Dhy/aB0+tH+J6x46acWniOUihEPWXl\nPzeXrcs2E/Tr9q6jPO2pYDgGIwKBgQDPFAykf7mIDfKxemVyMgwm9tgKxB8BFn8A\nHQou3Bacv0A66msjbsVMujr456ufPHn82RRFudikLDOe/32dBRBrGlBK44zQAGMZ\n4gBo+qVtnC9Ypr2kVP/ezNzCNgLTIuOKow3ypsVlxQI8nScq45jnBdfKr19eZ4DH\nJpnhivY9WwKBgAnPkP5fuyWm/t/m/EtL4sJVjnHwibNkAOm/6DGIqvsXeJFbsdYq\nGhKpk1PVRBGCExDObv0bAqqCbiuqkdu36NjhbiqejSFMRSRqQMlh8TVl11n8rXc5\nO91hEvjYabWE5jq9ulqzGAx+aluesr8W1xKLFBmBoq/nS9MQwXLFjF1LAoGASytu\nA3DR+o+Fn+NcW/3K54IHnrDeyFhQNcxU2/nMw42xVTGvPqeBO38G1T/TzvP3HE/4\nye7Ss5XQD1GTWaJy+U4OA4FipkbdspGVsIX78zQVA8tTYAny7//RyzYsBFTP4I2c\nDI95bJ39V998TldcM9CtKshKiExuNNzQU01MYa0CgYBFolxgrT57TcZgBTjbO+s3\nJyjHasZNcAS+0M3328yvbnPsAoTqz1XCDn8RnmFXBUVPHQzpX8S6sH6ICRx7liD4\n+fxDcCpjOrU5EMscW9d3yYlIUHCJap1Em3DY5Ce37aa6XjB7eZ/5na+dZDiF9aYy\nz7x/r+HbwEJBJuogxnE+yg==\n-----END PRIVATE KEY-----\n";
const CLIENT_EMAIL = "crypto-usdt-sheet@crypto-usdt.iam.gserviceaccount.com";

const doJob = async () => {
  const res = await axios.get(
    `https://v6.exchangerate-api.com/v6/${EXCHANGE_CURRENCY_API_KEY}/latest/USD`
  );
  console.log("res", res);
  const doc = new GoogleSpreadsheet(constants.CRYPTO_SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByTitle["exchange_rate"];
  await Promise.all([sheet.clearRows()]);
  const row = {
    USD: 1,
    VND: res.data.conversion_rates.VND,
    REIL: res.data.conversion_rates.KHR,
    PESO: res.data.conversion_rates.PHP,
  };
  await sheet.addRow(row);

  return;
};

doJob();
