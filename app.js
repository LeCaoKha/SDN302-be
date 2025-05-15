// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON
app.use('/api/auth', authRoutes);

// Sample route
app.get('/', (req, res) => {
  res.send('Preschool Enrollment API is running');
});

// Export app
module.exports = app;
