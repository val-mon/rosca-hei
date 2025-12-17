const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/userinfo', async (req, res, next) => {
  try {
    const { user_token } = req.query;
    if (!user_token || user_token.length === 0) {
      return res.status(400).json({ error: 'User token invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // get the user infos from the user_id
    const user_info = await db.select('"user"', { id: user_id }, 'id, username, email, privacy_consent');
    const userData = user_info[0];

    // send the respond in json
    const rep = {
      user_token,
      id: userData.id,
      username: userData.username,
      email: userData.email,
      privacy_consent: userData.privacy_consent
    };
    res.json(rep);
  }
  catch (err) {
    next(err);
  }
});

router.post('/create_circle', async (req, res, next) => {
  try {
    const { user_token, circle_name } = req.body;
    if (!user_token || !circle_name) {
      return res.status(400).json({ error: 'User_token or Circle_name invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // generate unique join_code
    const join_code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // create circle
    const circle = await db.insert('circle', { name: circle_name, join_code });

    // add user as admin
    await db.insert('circle_member', { circle_id: circle.id, user_id, is_admin: true });

    res.json({ success: true, circle_id: circle.id, join_code: circle.join_code });
  }
  catch (err) {
    next(err);
  }
});

router.post('/join_circle', async (req, res, next) => {
  try {
    const { user_token, join_code } = req.body;
    if (!user_token || !join_code) {
      return res.status(400).json({ error: 'User_token or Join_code invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // find circle by join_code
    const circleResult = await db.select('circle', { join_code }, 'id');
    const circle_id = circleResult[0].id;

    // add user as member
    await db.insert('circle_member', { circle_id, user_id, is_admin: false });

    res.json({ success: true, circle_id });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
