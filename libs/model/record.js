var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Record = new Schema({
      datestamp: {
        type: Date,
        default: Date.now,
      },
      deviceId: {
        type: String,
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

module.exports = mongoose.model('Record', Record);
