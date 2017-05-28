var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require('./statuses');

var db = require(libs + 'db/mongoose');
var Device = require(libs + 'model/device');
var DeviceLogic = require(libs + 'logic/device');

router.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  function(req, res, next) {
    log.info('I`m here', req.body.name, req.body.deviceId, user);
    var device = new Device({
      name: req.body.name,
      deviceId: req.body.deviceId,
      userId: user.id,
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
