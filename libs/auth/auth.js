var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var config = require(libs + 'config');

var User = require(libs + 'model/user');

const localOptions = {
  usernameField: 'email'
};
// Setting up local login strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(
        null,
        false,
        {
          error:
          'Your login details could not be verified. Please try again.'
        }
      );
    }

    if (user.checkPassword(password)) {
      return done(null, user);
    } else {
      return done(
        null,
        false,
        {
          error:
          'Your login details could not be verified. Please try again.'
        }
      );
    }
  });
});

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {

  passport.use(localLogin);

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      err
        ? done(err)
        : done(null, user);
    });
  });

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
