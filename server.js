require('rootpath')();

const logger = require('./config/Winston');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
//const logger = require('morgan');
const requestIp = require('request-ip');

const app = express();

app.use(requestIp.mw());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
//app.use(logger());

// use JWT auth to secure the api
//app.use(jwt());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  
  next();
});

// api routes
app.use(require('./router'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 3000;
const server = app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
