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

    // get the user infos from the user_id and verify user is valid
    const user_info = await db.select('"user"', { id: user_id, valid: true }, 'id, username, email, privacy_consent');
    if (!user_info || user_info.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    const userData = user_info[0];

    // get the circles the user belongs to
    const circlesResult = await db.query(
      ` SELECT
          c.id as circle_id,
          c.name,
          (SELECT cy.contribution_amount FROM cycle cy WHERE cy.circle_id = c.id ORDER BY cy.id DESC LIMIT 1) as contribution_amount,
          (SELECT COUNT(*) FROM circle_member WHERE circle_id = c.id) as member_count,
          (SELECT p.due_date FROM period p
           JOIN cycle cy ON p.cycle_id = cy.id
           WHERE cy.circle_id = c.id
           ORDER BY p.due_date DESC LIMIT 1) as due_date
        FROM circle c
        JOIN circle_member cm ON c.id = cm.circle_id
        WHERE cm.user_id = $1`,
      [user_id]
    );

    // calculate payout_amount for each circle
    const circles = circlesResult.rows.map(circle => ({
      circle_id: circle.circle_id,
      name: circle.name,
      contribution_amount: circle.contribution_amount,
      due_date: circle.due_date,
      payout_amount: circle.contribution_amount * circle.member_count
    }));

    // send the respond in json
    const rep = {
      user_token,
      id: userData.id,
      username: userData.username,
      email: userData.email,
      privacy_consent: userData.privacy_consent,
      circles
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

    // verify user is valid
    const userCheck = await db.select('"user"', { id: user_id, valid: true }, 'id');
    if (!userCheck || userCheck.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

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

    // verify user is valid
    const userCheck = await db.select('"user"', { id: user_id, valid: true }, 'id');
    if (!userCheck || userCheck.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

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

router.get('/useractiveauctions', async (req, res, next) => {
  try {
    const { user_token } = req.query;
    if (!user_token || user_token.length === 0) {
      return res.status(400).json({ error: 'User_token invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // verify user is valid
    const userCheck = await db.select('"user"', { id: user_id, valid: true }, 'id');
    if (!userCheck || userCheck.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // get active auctions for user's circles
    const auctionsResult = await db.query(
      `SELECT
        c.id as circle_id,
        c.name as circle_name,
        p.id as period_id,
        p.due_date as end_date,
        cy.contribution_amount * (SELECT COUNT(*) FROM circle_member WHERE circle_id = c.id) as payout_amount,
        COALESCE(user_auction.ammount, 0) as user_bid_amount,
        COALESCE(max_auction.ammount, 0) as current_highest_bid,
        COALESCE(winner.username, '') as current_winner,
        CASE
          WHEN user_auction.ammount = max_auction.ammount AND user_auction.ammount > 0 THEN true
          ELSE false
        END as is_winning
      FROM period p
      JOIN cycle cy ON p.cycle_id = cy.id
      JOIN circle c ON cy.circle_id = c.id
      JOIN circle_member cm ON c.id = cm.circle_id
      LEFT JOIN auction user_auction ON p.id = user_auction.period_id AND user_auction.user_id = $1
      LEFT JOIN (
        SELECT period_id, MAX(ammount) as ammount
        FROM auction
        GROUP BY period_id
      ) max_auction ON p.id = max_auction.period_id
      LEFT JOIN auction winning_auction ON p.id = winning_auction.period_id AND winning_auction.ammount = max_auction.ammount
      LEFT JOIN "user" winner ON winning_auction.user_id = winner.id
      WHERE cm.user_id = $1
        AND cy.auction_mode = true
        AND p.due_date > CURRENT_DATE
        AND c.valid = true
      ORDER BY p.due_date ASC`,
      [user_id]
    );

    const auctions = auctionsResult.rows.map(auction => ({
      circle_id: auction.circle_id,
      circle_name: auction.circle_name,
      period_id: auction.period_id,
      payout_amount: parseFloat(auction.payout_amount),
      user_bid_amount: parseFloat(auction.user_bid_amount),
      current_highest_bid: parseFloat(auction.current_highest_bid),
      current_winner: auction.current_winner || 'No bids yet',
      is_winning: auction.is_winning,
      end_date: auction.end_date
    }));

    res.json({ auctions });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
