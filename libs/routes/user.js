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
var validateUser = require(libs + 'model/schema/user');

router.get(
  '/info',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json({
    	user_id: req.user.userId,
    	email: req.user.email,
    });
  }
);

router.get(
  '/:id',
  passport.authenticate('bearer', { session: false }),
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

router.post(
  '/register',
  function(req, res) {
    if (
      !req.body.hasOwnProperty('name')
      || !req.body.hasOwnProperty('email')
      || !req.body.hasOwnProperty('password')
    ) {
      res.statusCode = 400;
      return res.send({
        status: status.WRONG_JSON,
        message: "Missing required fields"
      })
    }
    var valid = validateUser.register(req.body);
    if (!valid) {
      let statusForSend = status.WRONG_JSON;
      let errors = validateUser.register.errors;
      let statuses = {
        'name': status.USER_NAME_INCORRECT_FORMAT,
        'email': status.EMAIL_INCORRECT_FORMAT,
        'password': status.PASSWORD_INCORRECT_FORMAT,
      }
      errors.forEach(function (item) {
        let prop = item.dataPath.substr(1);
        if (statuses.hasOwnProperty(prop)) {
          statusForSend = statuses[prop];
        }
      })
      var message = errors.reduce(function(res, item) {
        return res + item.message + '; ';
      }, '');
      res.statusCode = 422;
      return res.send({
        status: statusForSend,
        message
      });
    }

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

router.post('/login', function(req, res) {
  log.info(req.body);
  if (
    !req.body.hasOwnProperty('email')
    || !req.body.hasOwnProperty('password')
  ) {
    res.statusCode = 400;
    return res.send({
      status: status.WRONG_JSON,
      message: "Missing required fields"
    })
  }
  var valid = validateUser.login(req.body);
  if (!valid) {
    let statusForSend = status.WRONG_JSON;
    let errors = validateUser.login.errors;
    log.info(errors);
    let statuses = {
      'email': status.EMAIL_INCORRECT_FORMAT,
      'password': status.PASSWORD_INCORRECT_FORMAT,
    }
    errors.forEach(function (item) {
      let prop = item.dataPath.substr(1);
      if (statuses.hasOwnProperty(prop)) {
        statusForSend = statuses[prop];
      }
    })
    var message = errors.reduce(function(res, item) {
      return res + item.message + '; ';
    }, '');
    res.statusCode = 422;
    return res.send({
      status: statusForSend,
      message
    });
  }
  User.findOne({
    email: req.body.email
  }, function(err, user) {
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
        res.statusCode = 200;
        return res.send({
          status: status.STATUS_OK,
          token: 'JWT ' + token
        });
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
