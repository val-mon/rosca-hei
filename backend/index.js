require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes de base
app.get('/api', (req, res) => {
  res.json({ message: 'API is running!' });
});

// CONNECTION ROUTES
app.get('/api/create', (req, res) => {
  const { email, username, consent } = req.query;
  // TODO: Create user and return user_token
  res.json({ user_token: 'placeholder_token' });
});

app.post('/api/sendcode', (req, res) => {
  const { email } = req.body;
  // TODO: Send one-time code to email
  res.json({ success: true, message: 'Code sent' });
});

app.get('/api/login', (req, res) => {
  const { email, onetime_code } = req.query;
  // TODO: Verify code and return user_token
  res.json({ user_token: 'placeholder_token' });
});

app.post('/api/logout', (req, res) => {
  const { user_token } = req.body;
  // TODO: Invalidate user_token
  res.json({ success: true, message: 'Logged out' });
});

// DASHBOARD ROUTES
app.get('/api/userinfo', (req, res) => {
  const { user_token } = req.query;
  // TODO: Get user info and circles
  res.json({
    user_token,
    user_id: 1,
    name: 'placeholder',
    email: 'placeholder@email.com',
    consent: true,
    circles: []
  });
});

app.post('/api/create_circle', (req, res) => {
  const { user_id, circle_name } = req.body;
  // TODO: Create circle and add user as admin
  res.json({ success: true, circle_id: 1 });
});

app.post('/api/join_circle', (req, res) => {
  const { user_id, join_code } = req.body;
  // TODO: Add user to circle
  res.json({ success: true, circle_id: 1 });
});

// CIRCLE PAGE ROUTES
app.get('/api/circle', (req, res) => {
  const { user_token, circle_id } = req.query;
  // TODO: Get circle details
  res.json({
    circle_id,
    circle_name: 'placeholder',
    join_code: 'ABC123',
    contribution_ammount: 100,
    members: [],
    periods: []
  });
});

app.post('/api/contribute', (req, res) => {
  const { user_id, circle_id, period_date } = req.body;
  // TODO: Record contribution
  res.json({ success: true });
});

app.post('/api/auction', (req, res) => {
  const { user_id, circle_id, period_date, ammount } = req.body;
  // TODO: Record auction bid
  res.json({ success: true });
});

app.post('/api/flaguser', (req, res) => {
  const { user_id, circle_id } = req.body;
  // TODO: Flag user for penalty
  res.json({ success: true });
});

app.post('/api/change_settings', (req, res) => {
  const { circle_id, name, contribution_ammount, period_duration, auction_mode } = req.body;
  // TODO: Update circle settings
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
