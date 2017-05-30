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
var validateDeviceJSON = require(libs + 'model/schema/device');
var validate = require(libs + 'validation/validate');

router.use(jwtVerify);

router.post(
  '/create',
  function(req, res) {
    log.info('I`m here', req.body.name, req.body.deviceId, req.user);
    if (!validate.validateRequiredExists(req.body, ['name', 'deviceId'])) {
      res.statusCode = 400;
      return res.send({
        status: status.WRONG_JSON,
        message: "Missing required fields"
      })
    }
    var device = new Device({
      name: req.body.name,
      deviceId: req.body.deviceId,
      userId: req.user._id,
    });

    device.save(function (err) {
      if (!err) {
          log.info("device created");
          return res.send({ status: status.STATUS_OK, device: device });
      } else {
          console.log(err);
          if(err.name == 'ValidationError') {
              res.statusCode = 400;
              res.send({ status: status.WRONG_JSON });
          } else {
              res.statusCode = 500;
              res.send({ status: 'Server error' });
          }
          log.error('Internal error(%d): %s',res.statusCode,err.message);
      }
    });
  }
);

module.exports = router;
