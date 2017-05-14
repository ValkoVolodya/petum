var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.get('mongoose:url'));
var db = mongoose.connection;

db.on('error', function (err) {
});
db.once('open', function callback () {
});

var Schema = mongoose.Schema;

var Pet = new Schema({
  name: {
    type: String,
    required: true,
  },
  sort: {
    type: String,
    enum: ['dog', 'cat'],
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  weight: {
    type: Number,
    required: false,
  },
  age: {
    year: {
      type: Number,
      required: false,
    },
    month: {
      type: Number,
      required: false,
    },
  },
});

var User = new Schema({
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
});

var Record = new Schema({
  datestamp: {
    type: Date,
    default: Date.now,
  },
  petId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  temperature: {
    type: Number,
    required: false,
  },
  humidity: {
    type: Number,
    required: false,
  },
});

// validation
// create a separate module for this thing
function checkEmail(email) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!reg.test(email)) return false;
    return true;
}

User.path('email').validate(checkEmail);

var PetModel = mongoose.model('Pet', Pet);
var UserModel = mongoose.model('User', User);
var RecordModel = mongoose.model('Record', Record);

module.exports.PetModel = PetModel;
module.exports.UserModel = UserModel;
module.exports.RecordModel = RecordModel;
