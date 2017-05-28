var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require('./statuses');

var db = require(libs + 'db/mongoose');
var Pet = require(libs + 'model/pet');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Pet.find(function(err, pets) {
      if(!err) {
        return res.send(pets);
      } else {
        res.statusCode = 500;
        log.error('Internal server error(%d): %s',res.statusCode,err.message);
        return res.send({ status: 'Server error' });
      }
    });
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    Pet.findById(req.params.id, function (err, pet) {
      if (!pet) {
        res.statusCode = 404;
        return res.send({ status: 'Not Found' });
      }
      if (!err) {
        return res.send({ status : status.STATUS_OK, pet: pet });
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
  passport.authenticate('jwt', { session: false }),
  function(req, res) {

    var pet = new Pet({
      name: req.body.name,
      sort: req.body.sort,
      userId: req.body.userId,
      weight: req.body.weight,
      age: req.body.age,
    });

    pet.save(function (err) {
      if (!err) {
          log.info("pet created");
          return res.send({ status: status.STATUS_OK, pet: pet });
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
