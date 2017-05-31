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
var Device = require(libs + 'logic/device');
var validateRecord = require(libs + 'model/schema/record');
var validate = require(libs + 'validation/validate');

function checkDevice(req, res, next) {
  Device.getByDeviceId(req.query.deviceId, function(err, device) {
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
  });
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

module.exports = router;
