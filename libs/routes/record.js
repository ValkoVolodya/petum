var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require('./statuses');

var db = require(libs + 'db/mongoose');
var Record = require(libs + 'model/record');


router.get(
  '/:id',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    Record.findById(req.params.id, function (err, record) {
      if (!record) {
        res.statusCode = 404;
        return res.send({ status: 'Not Found' });
      }
      if (!err) {
        return res.send({ status: status.STATUS_OK, record: record });
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
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    var record = new Record({
      petId: req.body.petId,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
    });

    record.save(function (err) {
      if (!err) {
          log.info("record created");
          return res.send({ status: status.STATUS_OK, record: record });
      } else {
          log.error(err);
          if(err.name == 'ValidationError') {
              res.statusCode = 400;
              res.send({ error: status.WRONG_JSON });
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
