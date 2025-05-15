const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Signup
// routes/auth.js or similar
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Simulated database check
    const userExists = false; // Replace with real DB check
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Save user to DB here
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) res.json({ message: "Login success", userId: user._id });
    else res.status(401).json({ error: "Invalid credentials" });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
