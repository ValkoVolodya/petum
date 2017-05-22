var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';

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
        return res.send({ error: 'Not Found' });
      }
      if (!err) {
        return res.send({ 'status' : 'OK', user: user });
      } else {
        res.statusCode = 500;
        log.error('Internal server error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
  }
);

router.post(
  '/create',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    var user = new User({
      name: req.body.name,
      email: req.body.email,
    });

    user.save(function (err) {
      if (!err) {
          log.info("user created");
          return res.send({ status: 'OK', user: user });
      } else {
          console.log(err);
          if(err.name == 'ValidationError') {
              res.statusCode = 400;
              res.send({ error: 'Validation error' });
          } else {
              res.statusCode = 500;
              res.send({ error: 'Server error' });
          }
          log.error('Internal error(%d): %s',res.statusCode,err.message);
      }
    });
  }
);

module.exports = router;
