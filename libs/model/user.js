var mongoose = require('mongoose'),
    crypto = require('crypto'),

    Schema = mongoose.Schema,

    User = new Schema({
      name: {
        first: {
          type: String,
          required: true,
        },
        last: {
          type: String,
          required: true,
        },
      },
      email: {
        type: String,
        required: true,
      },
      hashedPassword: {
        type: String,
        required: true
      },
      salt: {
        type: String,
        required: true
      },
      created: {
        type: Date,
        default: Date.now
      }
    });

User.methods.encryptPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

User.virtual('userId')
  .get(function () {
    return this.id;
  });

User.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('base64');
    //more secure - this.salt = crypto.randomBytes(128).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
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
