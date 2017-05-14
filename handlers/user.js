var UserModel = require('../lib/db').UserModel,
    log = require('../lib/log')(module);

exports.view = function(req, res) {
  return UserModel.findById(req.params.id, function (err, user) {
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

exports.create = function(req, res) {
  var user = new UserModel({
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
