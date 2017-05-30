'use strict'

var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require(libs + 'routes/statuses');
var jwtVerify = require(libs + 'auth/authVerify');

var db = require(libs + 'db/mongoose');
var Device = require(libs + 'model/device');
var DeviceLogic = require(libs + 'logic/device');
var validateDevice = require(libs + 'model/schema/device');
var validate = require(libs + 'validation/validate');

router.use(jwtVerify);

router.post(
  '/create',
  function(req, res) {
    if (!validate.validateRequiredExists(req.body, ['name', 'deviceId'])) {
      res.statusCode = 400;
      return res.send({
        status: status.WRONG_JSON,
        message: "Missing required fields"
      })
    }
    var statuses = {
      'name': status.DEVICE_NAME_INCORRECT_FORMAT,
      'deviceId': status.DEVICE_ID_INCORRECT_FORMAT,
    };
    var device = new Device({
      name: req.body.name,
      deviceId: req.body.deviceId,
      userId: req.user._id,
    });
    var errors = validate.validateFields(device, validateDevice.create);
    if (errors) {
      res.statusCode = 422;
      return res.send(validate.makeValidationResponse(errors, statuses));
    }

    Device.findOne({ deviceId: device.deviceId }, function(err, item) {
      if (err) throw err;
      if (item) {
        res.statusCode = 422;
        return res.send({
          status: status.DEVICE_ALREADY_EXISTS,
          message: "That email address already exists"
        })
      } else {
        device.save(function (err) {
          if (!err) {
              log.info("device created");
              return res.send({
                status: status.STATUS_OK,
                message: 'Device created successfully',
                device: {
                  deviceId: device.deviceId,
                  name: device.name
                }
              });
          } else {
            console.log(err);
            if(err.name == 'ValidationError') {
              res.statusCode = 400;
              res.send({
                status: status.WRONG_JSON,
                message: err.message
              });
            } else {
              res.statusCode = 500;
              res.send({
                status: status.SERVER_ERROR,
                message: err.message
              });
            }
            log.error('Internal error(%d): %s',res.statusCode,err.message);
          }
        });
      }
    });
});

module.exports = router;
