const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  

// Import your mongoose models (Question, User, Attempt)
const Question = require('./models/question');
const User = require('./models/user');
const Attempt = require('./models/attempt');

// Middleware
app.use(bodyParser.json());

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/login', (req, res) => {
  const { rollNo, password } = req.body;

  
  const token = jwt.sign({ rollNo }, process.env.JWT_SECRET);
  res.json({ token });
});

app.get('/random-question', authenticateToken, async (req, res) => {
  try {
    const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
    res.json(randomQuestion[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/correct-answer', authenticateToken, async (req, res) => {
  try {
    const correctAnswer = await getCorrectAnswer(req.questionId);
    res.json({ correctOption: correctAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/store-attempt', authenticateToken, async (req, res) => {
  const { score } = req.body;
  const userId = req.user.rollNo;

  try {
    const newAttempt = new Attempt({ userId, score });
    await newAttempt.save();
    res.json({ message: 'Attempt stored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/attempts', authenticateToken, async (req, res) => {
  const userId = req.user.rollNo;

  try {
    const userAttempts = await Attempt.find({ userId });
    res.json(userAttempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
