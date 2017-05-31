var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Device = new Schema({
      name: {
        type: String,
        required: true
      },
      deviceId: {
        type: String,
        unique: true,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        required: false,
      }
    });

module.exports = mongoose.model('Device', Device);
