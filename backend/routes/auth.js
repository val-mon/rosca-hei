const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/create', async (req, res, next) => {
  try {
    const { email, username, consent } = req.query;
    if (!email || !username || !consent) {
      return res.status(400).json({ error: 'Email, Username or Consent invalid' });
    }

    // TODO: Create user and return user_token

    res.json({ user_token: 'placeholder_token' });
  }
  catch (err) {
    next(err);
  }
});

router.post('/sendcode', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email invalid' });
    }

    // TODO: Send one-time code to email

    res.json({ success: true, message: 'Code sent' });
  }
  catch (err) {
    next(err);
  }
});

router.get('/login', async (req, res, next) => {
  try {
    const { email, onetime_code } = req.query;
    if (!email || !onetime_code) {
      return res.status(400).json({ error: 'Email or Onetime_code invalid' });
    }

    // TODO: Verify code and return user_token

    res.json({ user_token: 'placeholder_token' });
  }
  catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { user_token } = req.body;
    if (!user_token) {
      return res.status(400).json({ error: 'User_token invalid' });
    }

    // TODO: Invalidate user_token

    res.json({ success: true, message: 'Logged out' });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
