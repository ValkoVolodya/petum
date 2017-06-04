'use strict';

var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');

var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var status = require('./statuses');

var db = require(libs + 'db/mongoose');
var User = require(libs + 'model/user');
var Device = require(libs + 'logic/device');
var validateUser = require(libs + 'model/schema/user');
var validate = require(libs + 'validation/validate');


router.get(
  '/info',
  function(req, res) {
    res.json({
    	user_id: req.user.userId,
    	email: req.user.email,
    });
  }
);

router.get(
  '/edit',
  function(req, res) {
    return User.findById(req.params.id, function (err, user) {
      if (!user) {
        res.statusCode = 404;
        return res.send({ status: 'Not Found' });
      }
      if (!err) {
        return res.send({ status : status.STATUS_OK, user: user });
      } else {
        res.statusCode = 500;
        log.error('Internal server error(%d): %s',res.statusCode,err.message);
        return res.send({ status: 'Server error' });
      }
    });
  }
);

router.use(
  '/register',
  validate.getValidationMiddleware(
    ['name', 'email', 'password'],
    {
      'name': status.USER_NAME_INCORRECT_FORMAT,
      'email': status.EMAIL_INCORRECT_FORMAT,
      'password': status.PASSWORD_INCORRECT_FORMAT,
    },
    validateUser.register
  )
);
router.post(
  '/register',
  function(req, res) {
    User.findOne({ email: req.body.email }, function(err, item) {
      if (err) throw err;
      if (item) {
        res.statusCode = 422;
        return res.send({
          status: status.EMAIL_IS_ALREADY_TAKEN,
          message: "That email address already exists"
        })
      } else {
        var user = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });

        user.save(function (err) {
          if (err) {
            log.info(err);
            res.statusCode = 500;
            return res.send({
              status: status.SERVER_ERROR,
              message: "Server error"
            });
          }
          log.info(`User with _id(${user.id})  created`);
          res.send({ status: status.STATUS_OK });
        });
      }
    });

  }
);

router.use(
  '/login',
  validate.getValidationMiddleware(
    ['email', 'password'],
    {
      'email': status.EMAIL_INCORRECT_FORMAT,
      'password': status.PASSWORD_INCORRECT_FORMAT,
    },
    validateUser.login
  )
);
router.post(
  '/login',
  function(req, res) {
    User.findOne(
      {
        email: req.body.email
      },
      function(err, user) {
        if (err) throw err;

        if (!user) {
          res.statusCode = 401;
          return res.send({
            success: status.USER_DOES_NOT_EXIST,
            message: 'Authentication failed. User not found.'
          });
        } else {
          if (user.checkPassword(req.body.password)) {
            var token = jwt.sign(user, config.get('security:secret'), {
              expiresIn: 86400  // in seconds
            });
            Device.getByUserId(user.id, function(err, devices) {
              if (!err) {
                res.statusCode = 200;
                return res.send({
                  status: status.STATUS_OK,
                  token: 'JWT ' + token,
                  devices: devices
                });
              } else {
                res.statusCode = 200;
                return res.send({
                  status: status.STATUS_OK,
                  token: token,
                  devices: devices
                });
              }
            })
          } else {
            res.statusCode = 401;
            return res.send({
              status: status.WRONG_PASSWORD,
              message: 'Authentication failed. Passwords did not match.'
            });
          }
        }
      });
});

module.exports = router;
