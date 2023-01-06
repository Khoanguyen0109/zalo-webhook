import path from 'path';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { rError } from './utils/respones';

import webhook from './webhook'

import morgan from 'morgan';
global.APP = __dirname;
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
const routes = [
  webhook
];

for (let i = 0; i < routes.length; i++) {
  app.use(routes[i]);
}
app.get('/', async (req, res) => {
  res.json({ status: true, message: 'Our node.js app works' });
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
