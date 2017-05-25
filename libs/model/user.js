var mongoose = require('mongoose'),
  crypto = require('crypto'),
  passwordHash = require('password-hash'),
  libs = process.cwd() + '/libs/',
  log = require(libs + 'log')(module),

  Schema = mongoose.Schema,

  User = new Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      default: Date.now
    }
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);
User.pre('save', function(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
      user.password = user.encryptPassword(user.password);
      next();
  } else {
    return next();
  }
});

User.methods.encryptPassword = function(password) {
  log.info(password);
  return passwordHash.generate(password);
};

User.virtual('userId')
  .get(function () {
    return this.id;
  });

User.methods.checkPassword = function(password) {
  return passwordHash.verify(password, this.password);
};

// validation
// create a separate module for this thing
function checkEmail(email) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!reg.test(email)) return false;
    return true;
}

User.path('email').validate(checkEmail);

module.exports = mongoose.model('User', User);
