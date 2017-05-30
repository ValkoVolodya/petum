var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Device = new Schema({
      name: {
        type: String,
        unique: false,
        required: true
      },
      deviceId: {
        type: String,
        unique: true,
        required: true
      },
      userId: {
        type: String,
        required: false,
      }
    });

module.exports = mongoose.model('Device', Device);
