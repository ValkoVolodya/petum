var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var config = require(libs + 'config');

var User = require(libs + 'model/user');


// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromBodyField();
  opts.secretOrKey = config.get('security:secret');
  passport.use(new JwtStrategy(opts, function (jwt_payload, done){
    log.info('jwt data', Object.keys(jwt_payload));
    log.info('jwt data', jwt_payload._doc);
    User.findById(jwt_payload._doc._id, function(err, user) {
      if (err) {
        log.info('auth fail');
        return done(err, false);
      }
      if (user) {
        log.info('auth done');
        done(null, user);
      } else {
        log.info('auth 401');
        done(null, false);
      }
    });
  }));
};
