'use strict';

let express = require('express');
let passport = require('passport');
let jwt = require('jsonwebtoken');

let router = express.Router();

let libs = process.cwd() + '/libs/';
let log = require(libs + 'log')(module);
let config = require(libs + 'config');
let status = require(libs + 'routes/statuses');

let db = require(libs + 'db/mongoose');
let User = require(libs + 'model/user');
let Device = require(libs + 'logic/device');
let validateUser = require(libs + 'model/schema/user');
let validate = require(libs + 'validation/validate');


router.get('/login', function(req, res) {
  res.render('login.html');
});

router.get('/register', function(req, res) {
  res.render('register.html');
});

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
router.post('/login', function(req, res, next) {
  passport.authenticate('local',
    function(err, user, info) {
      return err
        ? next(err)
        : user
          ? req.logIn(user, function(err) {
              return err
                ? next(err)
                : res.redirect('/');
            })
          : res.redirect('/');
    }
  )(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

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

router.post('/register', function(req, res, next) {
  var user = new User({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  });
  log.info('Really login');
  user.save(function(err) {
    return err
      ? next(err)
      : req.logIn(user, function(err) {
        return err
          ? next(err)
          : res.redirect('/');
      });
  });
});

module.exports = router;
