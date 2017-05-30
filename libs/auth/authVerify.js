var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var status = require(libs + 'routes/statuses');
var jwt = require('jsonwebtoken');

var config = require(libs + 'config');

var User = require(libs + 'model/user');


module.exports = function(req, res, next) {
  // do logging
  log.info('Start token verification');

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.params.token || req.headers['x-access-token'];
  log.info('token ', token);
  // decode token
  // verifies secret and checks exp
  if (token) {
    jwt.verify(token, config.get('security:secret'), function(err, decoded) {
      if (err) {
        log.info('error ', err);
        res.status = 401;
        resStatus = status.WRONG_TOKEN;
        if (err.name === "TokenExpiredError") {
          resStatus = status.TOKEN_EXPIRED;
        }
        return res.send({ status: resStatus });
      }
      // if everything is good, save to request for use in other routes
      else {
        log.info('user ', decoded);
        req.user = decoded._doc;
        return next();
      }
    });
  }
  // if there is no token
  // return an HTTP response of 401 (access unauthorized) and an error message
  else {
    log.info('noToken');
    return next(noToken);
  }
}
