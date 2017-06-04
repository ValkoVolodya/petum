'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require(libs + 'routes/statuses');
var jwtVerify = require(libs + 'auth/authVerify');

var db = require(libs + 'db/mongoose');
var Record = require(libs + 'model/record');
var DeviceLogic = require(libs + 'logic/device');
var Device = require(libs + 'model/device');
var validateRecord = require(libs + 'model/schema/record');
var validate = require(libs + 'validation/validate');

function checkDevice(req, res, next) {
  DeviceLogic.getByDeviceId(
    req.query.deviceId || req.body.deviceId,
    function(err, device) {
      if (err) {
        res.statusCode = 500;
        return res.send({
          status: status.SERVER_ERROR,
          message: 'DB failed to create record'
        });
      }
      if (!device) {
        res.statusCode = 422;
        return res.send({
          status: status.DEVICE_ID_INCORRECT_FORMAT,
          message: 'Device with this id is not exists'
        });
      }
      return next();
    }
  );
};

router.use('/temperature', checkDevice);
router.get(
  '/temperature',
  function(req, res) {
    var record = new Record({
      deviceId: req.query.deviceId,
      temperature: req.query.temperature,
    });
    record.save(function (err) {
      if (!err) {
        log.info("Record created");
        res.statusCode = 200;
        return res.send({
          status: status.STATUS_OK,
          record: record
        });
      } else {
        if(err.name == 'ValidationError') {
          res.statusCode = 400;
          res.send({
            status: status.WRONG_JSON,
            message: 'Validation error'
          });
        } else {
          res.statusCode = 500;
          res.send({
            status: status.SERVER_ERROR
          });
        }
        log.error('Internal error(%d): %s',res.statusCode,err.message);
      }
    });
  }
);

var codeToTimeRange = {
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
}

function getTimeRangeByCode(date, code) {
  var dateCopy = new Date(date);
  log.info('date', codeToTimeRange[1](dateCopy));
  return codeToTimeRange[code](dateCopy);
};

router.use('/temperature/view', jwtVerify);
router.use(
  '/temperature/view',
  validate.getValidationMiddleware(
    ['deviceId', 'period'],
    {
      'deviceId': status.DEVICE_ID_INCORRECT_FORMAT,
      'period': status.INVALID_PERIOD
    },
    validateRecord.temperatureView
  )
);
router.use('/temperature/view', checkDevice);
router.post('/temperature/view', function(req, res) {
  var datetime = new Date();
  Record.find({ deviceId: req.body.deviceId }).
  where('datestamp').gt(getTimeRangeByCode(datetime, req.body.period)).lt(datetime).
  exec(function(err, records) {
    log.info('After query');
    if (err) {
      res.statusCode = 500;
      return res.send({
        status: status.SERVER_ERROR,
        message: 'Server error has occured'
      });
    }
    res.statusCode = 200;
    return res.send({
      status: status.STATUS_OK,
      message: 'Data is successfully retreived',
      values: records.map((rec) => rec.temperature)
    });
  });
});

module.exports = router;
