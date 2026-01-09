const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/circle', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.query;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // Get logged user id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    if (!tokenResult || tokenResult.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const logged_user_id = tokenResult[0].user_id;

    // Get circle details
    const circle_info = await db.select('circle', { id: circle_id }, 'name, join_code');
    const circleData = circle_info[0];

    // Get cycle info
    const cycle_info = await db.select('cycle', { circle_id: circle_id }, 'id, contribution_amount');
    const cycleData = cycle_info[0];

    // Get current period (closest due_date in the future)
    const current_period = await db.query(
      `SELECT id, due_date FROM period
       WHERE cycle_id = :cycle_id AND valid = true
       ORDER BY due_date ASC LIMIT 1`,
      { cycle_id: cycleData.id }
    );
    const currentPeriodData = current_period[0];

    // Get flagged users (3+ penalties)
    const flagged_users = await db.query(
      `SELECT pen.user_id
      FROM penalty pen
      JOIN period per ON per.id = pen.period_id
      JOIN cycle cy ON cy.id = per.cycle_id
      WHERE cy.circle_id = :circle_id
        AND pen.valid = true
      GROUP BY pen.user_id
      HAVING COUNT(pen.id) >= 3`,
      { circle_id: circle_id }
    );
    const flaggedUserIds = flagged_users.map(u => u.user_id);

    // Get members with user info and penalties
    const members_info = await db.query(
      `SELECT
        cm.user_id,
        cm.is_admin,
        u.username AS member_name
      FROM circle_member cm
      JOIN user u ON u.id = cm.user_id
      WHERE cm.circle_id = :circle_id AND cm.valid = true`,
      { circle_id: circle_id }
    );

    // Build members array with all required fields
    const members = await Promise.all(members_info.map(async (member) => {
      // Get penalties for this member in this circle
      const penalties = await db.query(
        `SELECT pen.id, pen.waived,
          CASE WHEN c.id IS NOT NULL THEN true ELSE false END AS paid
        FROM penalty pen
        JOIN period per ON per.id = pen.period_id
        JOIN cycle cy ON cy.id = per.cycle_id
        LEFT JOIN contribution c ON c.id = pen.contribution_id
        WHERE cy.circle_id = :circle_id
          AND pen.user_id = :user_id
          AND pen.valid = true`,
        { circle_id: circle_id, user_id: member.user_id }
      );

      return {
        logged: member.user_id === logged_user_id,
        isadmin: member.is_admin,
        user_id: member.user_id,
        member_name: member.member_name,
        flagged: flaggedUserIds.includes(member.user_id),
        contribution_amount: cycleData.contribution_amount,
        due_date: currentPeriodData ? currentPeriodData.due_date : null,
        penalties: penalties.map(p => ({ paid: p.paid }))
      };
    }));

    // Get periods with payout recipient name
    const periods = await db.query(
      `SELECT per.due_date AS date, u.username AS member_name
      FROM period per
      LEFT JOIN payout po ON po.period_id = per.id AND po.valid = true
      LEFT JOIN user u ON u.id = po.user_id
      WHERE per.cycle_id = :cycle_id AND per.valid = true
      ORDER BY per.due_date ASC`,
      { cycle_id: cycleData.id }
    );

    res.json({
      circle_id,
      circle_name: circleData.name,
      join_code: circleData.join_code,
      contribution_amount: cycleData.contribution_amount,
      members: members,
      periods: periods
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

    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    const cycleInfo = await db.select('cycle', { circle_id: circle_id }, 'id');
    const cycle_id = cycleInfo[0].id;

    const periodInfo = await db.select('period', { cycle_id: cycle_id, due_date: period_date }, 'id');
    const period_id = periodInfo[0].id;

    await db.insert('contribution', { period_id: period_id, user_id: user_id, for_user_id: user_id, contribution_date: period_date })

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

    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    const cycleInfo = await db.select('cycle', { circle_id: circle_id }, 'id');
    const cycle_id = cycleInfo[0].id;

    const periodInfo = await db.select('period', { cycle_id: cycle_id, due_date: period_date }, 'id');
    const period_id = periodInfo[0].id;

    const auctionInfo = await db.select('auction', { period_id: period_id, user_id: user_id }, 'id, period_id, user_id, contribution_date, ammount');
    const auction_id = auctionInfo[0].id;

    await db.update('auction', { valid: false }, { period_id: period_id, user_id: user_id });
    await db.insert('auction', { id: auction_id, period_id: period_id, user_id: user_id, contribution_date: period_date, ammount: ammount });

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

router.post('/kick_member', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.body;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }
    
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    await db.delete('circle_member', { user_id: user_id, circle_id: circle_id });

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
