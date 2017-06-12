'use strict';

let express = require('express');
let passport = require('passport');
let jwt = require('jsonwebtoken');

let router = express.Router();

let libs = process.cwd() + '/libs/';
let log = require(libs + 'log')(module);
let config = require(libs + 'config');
let status = require(libs + 'routes/statuses');

let db = require(libs + 'db/mongoose');
let User = require(libs + 'model/user');
let Device = require(libs + 'logic/device');
let validateUser = require(libs + 'model/schema/user');
let validate = require(libs + 'validation/validate');


router.get('/login', function(req, res) {
  res.render('layout.html');
});

module.exports = router;
