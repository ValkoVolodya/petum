var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require('./statuses');

var db = require(libs + 'db/mongoose');
var User = require(libs + 'model/user');

router.get('/info', passport.authenticate('bearer', { session: false }),
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
  '/create',
  function(req, res) {
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    user.save(function (err) {
      if (!err) {
          log.info("user created");
          return res.send({ status: status.STATUS_OK });
      } else {
          log.info(err);
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
