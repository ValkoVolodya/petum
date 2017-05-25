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
    if (!req.body.email || !req.body.password) {
      res.send({
        status: status.WRONG_JSON,
        message: "Empty JSON body"
      })
    } else {
      var user = new User({
        email: req.body.email,
        password: req.body.password,
      });
      log.info(user);

      user.save(function (err) {
        if (err) {
          log.info(err);
          if(err.name == 'ValidationError') {
            res.statusCode = 400;
            res.send({
              status: status.WRONG_JSON,
              message: "That email address already exists"
            });
          } else {
            res.statusCode = 500;
            res.send({
              status: status.WRONG_JSON,
              message: "Server error"
            });
          }
        }
        log.info('User created');
        res.send({ status: status.STATUS_OK });
      });
    }
  }
);

router.post('/login', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      if (user.checkPassword(req.body.password)) {
        var token = jwt.sign(user, config.get('security:secret'), {
          expiresIn: 10080 // in seconds
        });
        res.send({
          status: status.STATUS_OK,
          token: 'JWT ' + token
        });
      } else {
        res.send({ status: status.WRONG_JSON, message: 'Authentication failed. Passwords did not match.' });
      }
    }
  });
});

module.exports = router;
