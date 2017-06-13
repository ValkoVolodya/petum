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
let Record = require(libs + 'model/record');
let validateUser = require(libs + 'model/schema/user');
let validate = require(libs + 'validation/validate');

const checkAuth = function(req, res, next) {
  log.info(req.isAuthenticated());
  if (req.isAuthenticated()) {
    log.info('nice');
    return next();
  }
  log.info('sheet');
  res.redirect('/user/login');
};

router.use('/create', checkAuth);
router.get('/create', function(req, res) {
  res.render('device/create.html');
});

router.use('/dashboard', checkAuth);
router.get('/dashboard', function(req, res) {
  Device.getByUserId(req.user._id, function(err, devices) {
    if (!err) {
      res.render(
        'device/dashboard.html',
        { devices: devices }
      );
    } else {
      res.render('device/dashboard.html');
    }
  });
});


// Take a rid of this sheet, in file, and other nicer things
const codeToTimeRange = {
  '0': function(date) {
    return date.setHours(date.getHours() - 1);
  },
  '1': function(date) {
    return date.setHours(date.getHours() - 6);
  },
  '2': function(date) {
    return date.setHours(date.getHours() - 12);
  },
  '3': function(date) {
    return date.setDate(date.getDate() - 1);
  },
  '4': function(date) {
    return date.setDate(date.getDate() - 7);
  },
  '5': function(date) {
    return date.setMonth(date.getMonth() - 1);
  }
};

function getTimeRangeByCode(date, code) {
  let dateCopy = new Date(date);
  log.info('date', codeToTimeRange[code](dateCopy));
  return codeToTimeRange[code](dateCopy);
}

router.get('/view/:id', function(req, res) {
  let datetime = new Date();
  log.info('DEVICE id ', req.params.id);
  Record.find({ deviceId: req.params.id }).
  where('datestamp').gt(getTimeRangeByCode(datetime, 3)).lt(datetime).
  exec(function(err, records) {
    log.info('After query');
    log.info(records);
    if (err) {
      res.statusCode = 500;
      return res.send({
        status: status.SERVER_ERROR,
        message: 'Server error has occured'
      });
    }
    res.render('device/view.html', { records:  records });
  });
});

module.exports = router;
