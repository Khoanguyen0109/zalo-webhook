import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { rError } from './utils/respones';
import dotenv from 'dotenv';

import morgan from 'morgan';
import { webhook } from './api/controller';
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
app.get('/', webhook);

app.post('/', webhook);

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
