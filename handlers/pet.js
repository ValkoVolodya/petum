var PetModel = require('../lib/db').PetModel,
    log = require('../lib/log')(module);

exports.list = function(req, res) {
  return PetModel.find(function(err, pets) {
    if(!err) {
      return res.send(pets);
    } else {
      res.statusCode = 500;
      log.error('Internal server error(%d): %s',res.statusCode,err.message);
      return res.send({ error: 'Server error' });
    }
  });
}

exports.view = function(req, res) {
  return PetModel.findById(req.params.id, function (err, pet) {
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

exports.create = function(req, res) {
  var pet = new PetModel({
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
