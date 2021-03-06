'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';
const passportService = require(libs + 'auth/auth')(passport);

var config = require('./config');
var log = require('./log')(module);

var user = require('./routes/user');
var pet = require('./routes/pet');
var device = require('./routes/device');
var record = require('./routes/record');
var status = require('./routes/statuses');
let login = require('./routes/web/login');
let devicesWeb = require('./routes/web/devices');
let landing = require('./routes/web/landing');

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('views', process.cwd() + '/views');
app.set('view engine', 'ejs');
app.use(express.static(process.cwd() + '/static/'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(session({
  secret: config.get('security:secret')
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', login);
app.use('/device', devicesWeb);
app.use('/', landing);
app.use('/api/user', user);
app.use('/api/device', device);
app.use('/api/pet', pet);
app.use('/api/record', record);

// catch 404 and forward to error handler
app.use(function(req, res, next){
  res.status(404);
  log.debug('%s %d %s', req.method, res.statusCode, req.url);
  res.json({
      error: 'Not found'
  });
});

// error handlers
app.use(function(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 ) {
    log.error(`Bad JSON - ${err.message}`);
    res.json({
      status: status.WRONG_JSON,
      error: err.message
    });
  }
});

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  log.error('%s %d %s', req.method, res.statusCode, err.message);
  res.json({
    status: status.SERVER_ERROR,
    error: err.message
  });
});

module.exports = app;
