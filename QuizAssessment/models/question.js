
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctOption: Number,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
