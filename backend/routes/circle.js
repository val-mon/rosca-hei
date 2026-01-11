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
    if (!circle_info || circle_info.length === 0) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    const circleData = circle_info[0];

    // Get the latest valid cycle for this circle
    const cycle_info = await db.query(
      `SELECT id, contribution_amount, auction_mode FROM cycle WHERE circle_id = $1 AND valid = true ORDER BY id DESC LIMIT 1`,
      [parseInt(circle_id)]
    );
    if (!cycle_info.rows || cycle_info.rows.length === 0) {
      return res.status(404).json({ error: 'No active cycle found for this circle' });
    }
    const cycleData = cycle_info.rows[0];

    // Get current period (closest due_date in the future)
    const current_period = await db.query(
      `SELECT id, due_date FROM period
       WHERE cycle_id = $1 AND valid = true
       ORDER BY due_date ASC LIMIT 1`,
      [cycleData.id]
    );
    const currentPeriodData = current_period.rows[0];

    // Get flagged users (3+ penalties)
    const flagged_users = await db.query(
      `SELECT pen.user_id
      FROM penalty pen
      JOIN period per ON per.id = pen.period_id
      JOIN cycle cy ON cy.id = per.cycle_id
      WHERE cy.circle_id = $1
        AND pen.valid = true
      GROUP BY pen.user_id
      HAVING COUNT(pen.id) >= 3`,
      [parseInt(circle_id)]
    );
    const flaggedUserIds = flagged_users.rows.map(u => u.user_id);

    // Get members with user info and penalties
    const members_info = await db.query(
      `SELECT
        cm.user_id,
        cm.is_admin,
        u.username AS member_name,
        u.email AS member_email
      FROM circle_member cm
      JOIN "user" u ON u.id = cm.user_id
      WHERE cm.circle_id = $1 AND cm.valid = true`,
      [parseInt(circle_id)]
    );

    // Get members
    const members = await Promise.all(members_info.rows.map(async (member, index) => {

      // Get penalties for this member in this circle
      const penalties = await db.query(
        `SELECT pen.id, pen.waived,
          CASE WHEN c.id IS NOT NULL THEN true ELSE false END AS paid
        FROM penalty pen
        JOIN period per ON per.id = pen.period_id
        JOIN cycle cy ON cy.id = per.cycle_id
        LEFT JOIN contribution c ON c.id = pen.contribution_id
        WHERE cy.circle_id = $1
          AND pen.user_id = $2
          AND pen.valid = true`,
        [parseInt(circle_id), member.user_id]
      );

      // Check if user has paid for current period
      const userContributions = currentPeriodData ? await db.query(
        `SELECT id FROM contribution
        WHERE period_id = $1 AND user_id = $2 AND valid = true`,
        [currentPeriodData.id, member.user_id]
      ) : { rows: [] };

      // Check if user has received payout
      const payoutReceived = await db.query(
        `SELECT po.id FROM payout po
        JOIN period per ON per.id = po.period_id
        JOIN cycle cy ON cy.id = per.cycle_id
        WHERE cy.circle_id = $1 AND po.user_id = $2 AND po.valid = true`,
        [parseInt(circle_id), member.user_id]
      );

      const unpaidPenalties = penalties.rows.filter(p => !p.paid && !p.waived);
      const totalPenalties = penalties.rows.filter(p => !p.waived).length;

      return {
        id: member.user_id,
        name: member.member_name,
        email: member.member_email,
        position: index + 1,
        hasPaid: userContributions.rows.length > 0,
        latePayments: unpaidPenalties.length,
        totalPenalties: totalPenalties,
        isFlagged: flaggedUserIds.includes(member.user_id),
        flagReason: flaggedUserIds.includes(member.user_id) ? '3+ penalties' : undefined,
        hasReceivedPayout: payoutReceived.rows.length > 0
      };
    }));

    // Get periods with payout recipient name, matching frontend Period type
    const periodsData = await db.query(
      `SELECT per.id, per.due_date, u.username AS recipient_name, po.user_id AS recipient_id
      FROM period per
      LEFT JOIN payout po ON po.period_id = per.id AND po.valid = true
      LEFT JOIN "user" u ON u.id = po.user_id
      WHERE per.cycle_id = $1 AND per.valid = true
      ORDER BY per.due_date ASC`,
      [cycleData.id]
    );

    const currentDate = new Date();
    const periods = periodsData.rows.map((period) => {
      const periodDate = new Date(period.due_date);
      let status;
      if (period.recipient_name) {
        status = 'completed';
      } else if (currentPeriodData && period.id === currentPeriodData.id) {
        status = 'current';
      } else if (periodDate > currentDate) {
        status = 'upcoming';
      } else {
        status = 'completed';
      }

      return {
        id: period.id,
        startDate: period.due_date, // Using due_date as both start and end for now
        endDate: period.due_date,
        recipient: period.recipient_name,
        recipientId: period.recipient_id,
        status: status,
        amount: cycleData.contribution_amount * members.length,
        hasAuction: cycleData.auction_mode
      };
    });

    // Return CircleDetails structure matching frontend type
    res.json({
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

    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    if (!tokenResult || tokenResult.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user_id = tokenResult[0].user_id;

    // Get the latest valid cycle for this circle
    const cycleInfo = await db.query(
      `SELECT id FROM cycle WHERE circle_id = $1 AND valid = true ORDER BY id DESC LIMIT 1`,
      [parseInt(circle_id)]
    );
    if (!cycleInfo.rows || cycleInfo.rows.length === 0) {
      return res.status(404).json({ error: 'No active cycle found for this circle' });
    }
    const cycle_id = cycleInfo.rows[0].id;

    // Find period by cycle and date
    const periodInfo = await db.query(
      `SELECT id FROM period WHERE cycle_id = $1 AND TO_CHAR(due_date, 'YYYY-MM-DD') = $2 AND valid = true LIMIT 1`,
      [cycle_id, period_date]
    );
    if (!periodInfo.rows || periodInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Period not found for the given date' });
    }
    const period_id = periodInfo.rows[0].id;

    await db.insert('contribution', { period_id: period_id, user_id: user_id, for_user_id: user_id, contribution_date: period_date });

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

    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    if (!tokenResult || tokenResult.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user_id = tokenResult[0].user_id;

    // Get the latest valid cycle for this circle
    const cycleInfo = await db.query(
      `SELECT id FROM cycle WHERE circle_id = $1 AND valid = true ORDER BY id DESC LIMIT 1`,
      [parseInt(circle_id)]
    );
    if (!cycleInfo.rows || cycleInfo.rows.length === 0) {
      return res.status(404).json({ error: 'No active cycle found for this circle' });
    }
    const cycle_id = cycleInfo.rows[0].id;

    // Find period by cycle and date
    const periodInfo = await db.query(
      `SELECT id FROM period WHERE cycle_id = $1 AND TO_CHAR(due_date, 'YYYY-MM-DD') = $2 AND valid = true LIMIT 1`,
      [cycle_id, period_date]
    );
    if (!periodInfo.rows || periodInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Period not found for the given date' });
    }
    const period_id = periodInfo.rows[0].id;

    // Invalidate all previous bids for this user and period
    await db.update('auction', { valid: false }, { period_id: period_id, user_id: user_id });

    // Insert new bid
    await db.insert('auction', { period_id: period_id, user_id: user_id, contribution_date: period_date, ammount: ammount });

    res.json({ success: true });
  }
  catch (err) {
    next(err);
  }
});

router.post('/change_settings', async (req, res, next) => {
  try {
    const { user_token, circle_id, circle_name } = req.body;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // Verify user has admin rights for this circle
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    if (!tokenResult || tokenResult.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user_id = tokenResult[0].user_id;

    const adminCheck = await db.select('circle_member', { circle_id: circle_id, user_id: user_id }, 'is_admin');
    if (!adminCheck || adminCheck.length === 0 || !adminCheck[0].is_admin) {
      return res.status(403).json({ error: 'Only circle admin can change settings' });
    }

    // Update circle name if provided
    if (circle_name) {
      // Get current circle data for history
      const currentCircle = await db.select('circle', { id: circle_id }, 'name, join_code');
      if (currentCircle && currentCircle.length > 0) {
        // Insert a copy with valid=false as history
        await db.insert('circle', {
          name: currentCircle[0].name,
          join_code: null, // Don't duplicate join_code (unique constraint)
          valid: false
        });
      }
      // Update the original (keeps valid=true)
      await db.update('circle', { name: circle_name }, { id: circle_id });
    }

    res.json({ success: true, message: 'Circle settings updated successfully' });
  }
  catch (err) {
    next(err);
  }
});

router.post('/kick_member', async (req, res, next) => {
  try {
    const { user_token, circle_id, member_id } = req.body;
    if (!user_token || !circle_id || !member_id) {
      return res.status(400).json({ error: 'User_token, Circle_id or Member_id invalid' });
    }

    // Verify requesting user is admin of the circle
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    if (!tokenResult || tokenResult.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user_id = tokenResult[0].user_id;

    const adminCheck = await db.select('circle_member', { circle_id: circle_id, user_id: user_id }, 'is_admin');
    if (!adminCheck || adminCheck.length === 0 || !adminCheck[0].is_admin) {
      return res.status(403).json({ error: 'Only circle admin can kick members' });
    }

    // Prevent admin from kicking themselves
    if (member_id === user_id) {
      return res.status(400).json({ error: 'Cannot kick yourself from the circle' });
    }

    // Remove the member from the circle (soft delete by setting valid=false)
    await db.update('circle_member', { valid: false }, { user_id: member_id, circle_id: circle_id });

    res.json({ success: true, message: 'Member removed from circle' });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
