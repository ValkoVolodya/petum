var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Pet = new Schema({
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

module.exports = mongoose.model('Pet', Pet);
