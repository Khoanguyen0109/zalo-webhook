const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { format, toDate } = require("date-fns");
const moment = require("moment-timezone");

router.post("/", async (req, res) => {
    // https://docs.google.com/spreadsheets/d/1rYYWmg1coPDofMtWI-687tUpJ3kz2LuUqDqCxEI02VI/edit#gid=0
    try {
      const doc = new GoogleSpreadsheet(
        "1rYYWmg1coPDofMtWI-687tUpJ3kz2LuUqDqCxEI02VI"
      );
      console.log(req.body);
      // var key =
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnYZTEeMv9GwI6\niryCGF/BDTWvywidy5a63FRtPNWIIszHAZP4gogJ3Hsh/hYqsRX12fRNvIOHZrlm\n4+PR2W2H225n8wf+1GD5CL3zyTO8YZ3Hn3iLFMF6dS1ObyqngWMGVniQTFZ1o1mC\nLES2S+/zF2OrnSTsutInGR1kycjT+rrgnRUNpH1Z4w1uE0MxBlTeDG4tooZLiplU\n+6zEw0BydMkaPpD27IcjUqxbwyKHefWCdEYeEz+gEZz+r6WjWbL/YsWeVO0ClfHy\n0SoKexv0/OZqLqdhEJxt7dOsudMrzdWDRXVJU8yZ6aba7U1s8ZKz0qfzlRpO7A+o\nF+i7VpbhAgMBAAECggEAAK1g+ZC/mngwpJEEv1n4QCI2D15rmXPvkc/ir9wCH82c\nU9yardkanNUE0Cct4sLmHDFF9eHFW8PC4a7KcGTMLBYwyJ8JsfEtB3tEAD7+MzD3\nN1BdclKJdWs7kBVRjDARE69aSBhwepPwWKSWO7aj14aeu7I7B3yP0rqH3AKtYfGb\nHbuC1Rc0dcsyokkDVyMD/4ccv8pugWM80ThXwV5bB9KxpOamNKNcVZESvgV7LHcY\nVWd2N1yiBg488Si1+6ydmvyOoEd7SnC0lqCTyFYEDRMCXM7W6zVkyimRu/ui3RiT\ndWQFJvXaeOVT1i6V0zm/NDkS+S67JwjSbV+o8woyAQKBgQDr5DSIR2y3cQPpAfsO\nx5HEVef6MyAG+uJ0VMPLJD7/4M4h2PMJJyZ3UB4H3z5BCks+cPruXAV3fQno7osa\nbZ2Mzs+Ggjmd7V8RR5LJ1PAhDc3eGqWel57ipKcnXAv9xvvTJOPVKBctP81FiAtX\n0DQ9+M9D/6RHg0+kf5iSKWmaAQKBgQC1pkuV+mIpPu5GuFwF42J5VzFjsM3vNBqj\nKo+nvaH8Mg/AfrTYspOybt0tZn3VizPq1AHPPBcftw5DJB4XX4N2yrhdoJp411UU\nLWGt+hBvGHswRPZWUubunhSFq0ywLErhzwqHHmz8wSYPo21zqwKbBanKnrfp9biD\nJPQzaW484QKBgH8XA0qNGMC4jf/Cxm2PDjT2h7YgR1gbYViFtrtCuwKHLufDiCVd\nR3cu3g8lste94Q4yNq+nOnbHEkjCBIXnmuObJOn2TW6NzhN0OVyucfWNB2ZreuG4\nFK1NQpWNHRTMWS7ICEv2fo4ter3Eb0APd6YP4DNljy/MSmN5L01ILJIBAoGBAJAK\nTeWfpjcOr+NkTZRdurh9a6yhhqsnpfe8yC07MjfJerQpxT4QXQ4g20IlA6NRvtl3\nQ/gQrkV34tdazIG8O4L3PTsBH3yzQ8O8OLi8kkuGHikohi3tjzGoKJ3WN/l7JeXp\nR2/dsI68mnHMJf6SnH5Q/1KsiSn8r1NO+lXKRKABAoGBAOs0Znx0ABKQ8RfJjNvF\nrZlN5uDiR85tVfgiD3I5wY6zE5TUFJN6r3amGO2Hj0Haz7oAqHI79z1MuZOZsrzN\nqku94XUaC3rD2t6r2kzUY2Xyh/yxZJDgw2nBl13FlzymORVEtDGU1DshLw8W1kv/\nDOEiKeX2TIUhFcGa3vZrtwpN\n-----END PRIVATE KEY-----\n";
      var e_mail = "global@appscript-380708.iam.gserviceaccount.com";
              
      // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
      await doc.useServiceAccountAuth({
        // env var values are copied = require(" service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email: e_mail,
        private_key: key.replace(/\\n/g, "\n"),
      });
  
      const info = await doc.loadInfo(); // loads document properties and worksheets
      const sheet = doc.sheetsByIndex[0];
      const messageObject = {
        event: req.body?.event_name,
        userId: req.body?.sender?.id,
        message: req.body?.message?.text,
        timestamp: moment
          .tz(new Date(), "Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY , hh:mm A"),
      };
      console.log(req.body);
      if (req?.body?.event_name === "oa_send_text") {
        const messag = messageObject.message;
        var matches = messag.match(/\[(.*?)\]/);
        if (matches) {
          const sheetName = matches[1];
          const sheetCheckTime = doc.sheetsByTitle[sheetName];
          const result = messag.split(/\r?\n/);
          const map = {};
          result.forEach((row) => {
            const info = row.split(": ");
            if (info[1]) {
              map[info[0]] = info[1];
            }
          });
          await sheetCheckTime.addRow(map);
        }
      }
  
      if (
        req?.body?.event_name === "user_send_text" ||
        req?.body?.event_name === "oa_send_text"
      ) {
        await sheet.addRows([messageObject]);
      }
      if (
        req?.body?.event_name === "user_send_image" ||
        req?.body?.event_name === "oa_send_image" ||
        req?.body?.event_name === "oa_send_list"
      ) {
        var atts = req.body.message.attachments
          .map(function (a) {
            return a.payload.thumbnail;
          })
          .join("\r\n");
        await sheet.addRows([
          {
            ...messageObject,
            attachment: atts,
          },
        ]);
      }
      if (req.body.event_name === "user_send_location") {
        var location = req.body.message.attachments[0].payload.coordinates;
        await sheet.addRows([
          {
            ...messageObject,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        ]);
      }
  
      return res.status(200).json({ message: "webhook" });
    } catch (error) {
      console.log("error", error);
      console.log("error", error);
    }
  });
module.exports = router;
