const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  datetime: {
    type: Date,
    default: Date.now,
  },
});

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
