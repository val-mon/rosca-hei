const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/circle', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.query;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // TODO: Get circle details

    res.json({
      circle_id,
      circle_name: 'placeholder',
      join_code: 'ABC123',
      contribution_ammount: 100,
      members: [],
      periods: []
    });
  }
  catch (err) {
    next(err);
  }
});

router.post('/contribute', async (req, res, next) => {
  try {
    const { user_token, circle_id, period_date } = req.body;
    if (!user_token || !circle_id || !period_date) {
      return res.status(400).json({ error: 'User_token, Circle_id or Period_date invalid' });
    }

    // TODO: Record contribution

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

router.post('/auction', async (req, res, next) => {
  try {
    const { user_token, circle_id, period_date, ammount } = req.body;
    if (!user_token || !circle_id || !period_date || !ammount) {
      return res.status(400).json({ error: 'User_token, Circle_id, Period_date or Ammount invalid' });
    }

    // TODO: Record auction bid

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

router.post('/flaguser', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.body;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // TODO: Flag user for penalty

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

router.post('/change_settings', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.body;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // TODO: Update circle settings

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
