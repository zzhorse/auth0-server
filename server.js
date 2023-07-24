import express from 'express';
import jwt from 'express-jwt';
import jwtAuthz from 'express-jwt-authz';
import jwtRsa from 'jwks-rsa';
import CORS from 'cors';
import bodyParser from "body-parser";
import _ from 'lodash';
import dotEnv from 'dotenv';
import {timeSheets} from "./data.js";
export { timeSheets } from './data.js';

dotEnv.config();

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file';
}

const app = express();

// Enable CORS
app.use(CORS());

const timesheets = timeSheets();

const checkJwt = jwt.expressjwt({
  secret: jwtRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/*
  auth: {
    iss: 'https://dev-sw34glsxvzywjyl0.jp.auth0.com/',
    sub: 'nw2IeN7nzAAU9o7fmOSYbDqd8VYNhZCn@clients',
    aud: 'zzhorse@gmail.com',
    iat: 1690165273,
    exp: 1690251673,
    azp: 'nw2IeN7nzAAU9o7fmOSYbDqd8VYNhZCn',
    scope: 'read:timesheets',
    gty: 'client-credentials'
  }
 */
// create timesheets API endpoint
app.get('/timesheets', checkJwt, jwtAuthz(['read:timesheets'], { customUserKey: 'auth' }), function (req, res) {
                                                                // function (req, res) 这里的 req 中没有 user 对象（express-jwt-authz 默认的属性），只有 auth
  // Get timesheet entries for this user
  var userEntries = timesheets;//.filter(entry => entry.user_id === req.auth.aud);

  //send the response
  res.status(200).send(userEntries);
});

app.get('/approvals', checkJwt, jwtAuthz(['approve:timesheets']), function (req, res) {
  var unapprovedEntries = timesheets.filter(entry => entry.approved == false);

  //send the response
  res.status(200).send(unapprovedEntries);
});

// launch the API Server at localhost:8080
app.listen(8080);
console.log('Listening on http://localhost:8080');
