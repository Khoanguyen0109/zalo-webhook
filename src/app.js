const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { rError } = require('./utils/respones');
const dotenv = require('dotenv');

const morgan = require('morgan');
// const { webhook } = require(" './api/controller';
const { GoogleSpreadsheet } = require('google-spreadsheet');

global.APP = __dirname;
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS origin
app.use(cors());
app.use(morgan('dev'));

// dissable cache-control
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Load the routes ("controllers" -ish)
// Setup routes here

// app.post('/api/webhook', webhook);
//htpps://goappscript.com/api/webhook
app.get('/api/webhook', async (req, res) => {
  return res.status(200).json({ message: 'webhook' });
});
app.post('/api/webhook', async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(
      '1RzTedxhXeK3OJq4RXs41HrgZj0gP1hlRrlsgkgpOfwo'
    );

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      // env var values are copied = require(" service account credentials generated by google
      // see "Authentication" section in docs for more info
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    const info = await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0];

    if (req?.body?.event_name === 'user_send_text') {
      await sheet.addRows([
        {
          event: req.body?.event_name,
          userId: req.body?.sender?.id,
          message: req.body?.message?.text,
        },
      ]);
    }
    if (req?.body?.event_name === 'user_send_image') {
      var atts = req.body.message.attachments.map(function (a) {
        console.log(a)
          return a.payload.thumbnail;
        })
        .join('\r\n');
      console.log('atts', atts);
      console.log('object', object);
      await sheet.addRows([
        {
          event: req.body?.event_name,
          userId: req.body?.sender?.id,
          message: req.body?.message?.text,
          attachment: atts,
        },
      ]);
    }
    return res.status(200).json({ message: 'webhook' });
  } catch (error) {
    console.log('error', error);
  }
});

app.use((err, req, res, next) => {
  const { message, code, subcode, errorItems, error } = err;

  return rError(
    res,
    code || 500,
    {
      message: message || 'Something went wrong!',
      subcode,
      errorItems,
    },
    error
  );
});
app.listen(PORT, () => console.log(`App listening at port ${PORT}`));

module.exports = app;
