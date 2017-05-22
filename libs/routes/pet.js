var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var Pet = require(libs + 'model/pet');

router.get(
  '/',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    Pet.find(function(err, pets) {
      if(!err) {
        return res.send(pets);
      } else {
        res.statusCode = 500;
        log.error('Internal server error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
  }
);

router.get(
  '/:id',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    Pet.findById(req.params.id, function (err, pet) {
      if (!pet) {
        res.statusCode = 404;
        return res.send({ error: 'Not Found' });
      }
      if (!err) {
        return res.send({ 'status' : 'OK', pet: pet });
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
          return res.send({ status: 'OK', pet: pet });
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
)

exports.create = function(req, res) {
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
        return res.send({ status: 'OK', pet: pet });
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

module.exports = router;
