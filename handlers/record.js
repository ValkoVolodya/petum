var RecordModel = require('../lib/db').RecordModel,
    log = require('../lib/log')(module);

exports.view = function(req, res) {
  return RecordModel.findById(req.params.id, function (err, record) {
    if (!record) {
      res.statusCode = 404;
      return res.send({ error: 'Not Found' });
    }
    if (!err) {
      return res.send({ 'status' : 'OK', record: record });
    } else {
      res.statusCode = 500;
      log.error('Internal server error(%d): %s',res.statusCode,err.message);
      return res.send({ error: 'Server error' });
    }
  });
}

exports.create = function(req, res) {
  var record = new RecordModel({
    petId: req.body.petId,
    temperature: req.body.temperature,
    humidity: req.body.humidity,
  });

  record.save(function (err) {
    if (!err) {
        log.info("record created");
        return res.send({ status: 'OK', record: record });
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
