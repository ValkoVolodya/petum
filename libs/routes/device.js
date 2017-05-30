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

// TODO: Make file for this later, and add some DRY
function deviceCreateValidation (req, res, next) {
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
  var errors = validate.validateFields(req.body, validateDevice.create);
  if (errors) {
    res.statusCode = 422;
    return res.send(validate.makeValidationResponse(errors, statuses));
  }
  return next();
};

function deviceDeleteValidation (req, res, next) {
  log.info('I`m here');
  if (!validate.validateRequiredExists(req.body, ['deviceId'])) {
    log.info('validateRequiredExists');
    res.statusCode = 400;
    return res.send({
      status: status.WRONG_JSON,
      message: "Missing required fields"
    })
  }
  var statuses = {
    'deviceId': status.DEVICE_ID_INCORRECT_FORMAT,
  };
  log.info('validateFields');
  var errors = validate.validateFields(req.body, validateDevice.delete);
  if (errors) {
    log.info('errors', errors);
    res.statusCode = 422;
    return res.send(validate.makeValidationResponse(errors, statuses));
  }
  log.info('next');
  return next();
};

function deviceRenameValidation (req, res, next) {
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
  var errors = validate.validateFields(req.body, validateDevice.rename);
  if (errors) {
    res.statusCode = 422;
    return res.send(validate.makeValidationResponse(errors, statuses));
  }
  return next();
};

router.use(jwtVerify);

router.use('/create', deviceCreateValidation);
router.post(
  '/create',
  function(req, res) {
    var device = new Device({
      name: req.body.name,
      deviceId: req.body.deviceId,
      userId: req.user._id,
    });

    Device.findOne({ deviceId: device.deviceId }, function(err, item) {
      if (err) throw err;
      if (item) {
        res.statusCode = 422;
        return res.send({
          status: status.DEVICE_ALREADY_EXISTS,
          message: "Device with this ID already created"
        })
      } else {
        device.save(function (err) {
          if (!err) {
              log.info("device created");
              res.statusCode = 200;
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
  }
);

router.use('/delete', deviceDeleteValidation);
router.post(
  '/delete',
  function(req, res) {
    Device.findByIdAndRemove({ deviceId: eq.body.deviceId }, function(err) {
      if (err) {
        res.statusCode = 500;
        return res.send({
          status: status.SERVER_ERROR,
          message: err.message
        });
      }
      res.statusCode = 200;
      return res.send({
        status: status.STATUS_OK,
        message: 'Device is successfully deleted'
      });
    })
  }
);

router.use('/rename', deviceRenameValidation);
router.post(
  '/rename',
  function(req, res) {
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
      device.name = req.body.name;
      device.save(function(err) {
        if (err) {
          res.statusCode = 500;
          return res.send({
            status: status.SERVER_ERROR,
            message: err.message
          });
        }
        res.statusCode = 200;
        return res.send({
          status: status.STATUS_OK,
          message: 'Device successfully renamed'
        })
      });
    });
  }
)

module.exports = router;
