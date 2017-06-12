'use strict';

let express = require('express');
let passport = require('passport');
let router = express.Router();

let libs = process.cwd() + '/libs/';
let log = require(libs + 'log')(module);
let status = require(libs + 'routes/statuses');
let jwtVerify = require(libs + 'auth/authVerify');

let db = require(libs + 'db/mongoose');
let Device = require(libs + 'model/device');
let DeviceLogic = require(libs + 'logic/device');
let validateDevice = require(libs + 'model/schema/device');
let validate = require(libs + 'validation/validate');


router.use(jwtVerify);

router.get(
  '/',
  function(req, res) {
    Device.find(function(err, devices) {
      if(err) {
        res.statusCode = 500;
        log.error('Internal server error(%d): %s',res.statusCode,err.message);
        return res.send({
          status: status.SERVER_ERROR,
          message: "Internal server error"
        });
      }
      res.statusCode = 200;
      return res.send(pets);
    });
  }
);

router.use(
  '/create',
  validate.getValidationMiddleware(
    ['name', 'deviceId'],
    {
      'name': status.DEVICE_NAME_INCORRECT_FORMAT,
      'deviceId': status.DEVICE_ID_INCORRECT_FORMAT
    },
    validateDevice.create
  )
);
router.post(
  '/create',
  function(req, res) {
    let device = new Device({
      name: req.body.name,
      deviceId: req.body.deviceId,
      userId: req.user._id
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
            if(err.name === 'ValidationError') {
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

router.use(
  '/delete',
  validate.getValidationMiddleware(
    ['deviceId'],
    {
      'deviceId': status.DEVICE_ID_INCORRECT_FORMAT
    },
    validateDevice.delete
  )
);
router.post(
  '/delete',
  function(req, res) {
    DeviceLogic.getByDeviceId(req.body.deviceId, function(err, device) {
      if (err) {
        res.statusCode = 500;
        return res.send({
          status: status.SERVER_ERROR,
          message: err.message
        });
      }
      if (!device) {
        res.statusCode = 422;
        return res.send({
          status: status.DEVICE_ID_INCORRECT_FORMAT,
          message: 'Device with this id not exists'
        });
      }
      if (device.userId !== req.user._id) {
        res.statusCode = 403;
        return res.send({
          status: status.OTHER_USER_OWNS_THIS_DEVICE_ID,
          message: 'You can`t delete this device'
        });
      }
      Device.find({ deviceId: req.body.deviceId }).remove(function(err) {
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
      });
    });
  }
);

router.use(
  '/rename',
  validate.getValidationMiddleware(
    ['name', 'deviceId'],
    {
      'name': status.DEVICE_NAME_INCORRECT_FORMAT,
      'deviceId': status.DEVICE_ID_INCORRECT_FORMAT
    },
    validateDevice.rename
  )
);;
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
);

module.exports = router;
