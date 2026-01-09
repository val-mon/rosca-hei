const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/globalstats', async (req, res, next) => {
  try {
    const { user_token } = req.query;
    if (!user_token || user_token.length === 0) {
      return res.status(400).json({ error: 'User_token invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // verify user is system admin
    const userResult = await db.select('"user"', { id: user_id }, 'email');
    if (userResult[0].email !== 'admin@rosca-hei.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // get total users (where valid = true)
    const totalUsersResult = await db.select('"user"', { valid: 'true' }, 'COUNT(*)')
    const total_users = parseInt(totalUsersResult[0].count);

    // get total circles (where valid = true)
    const totalCirclesResult = await db.select('circle', { valid: 'true' }, 'COUNT(*)')
    const total_circles = parseInt(totalCirclesResult[0].count);

    // get funds circulating (sum of all contribution amounts in active cycles)
    const fundsResult = await db.query(
      `SELECT SUM(
         cy.contribution_amount * (
           SELECT COUNT(*)
           FROM circle_member cm
           WHERE cm.circle_id = cy.circle_id
         )
       ) AS total
        FROM cycle cy
        JOIN circle c ON cy.circle_id = c.id
        WHERE cy.valid = true
          AND c.valid = true;`
    );
    const funds_circulating = parseFloat(fundsResult.rows[0].total);

    // get average circle size
    const avgSizeResult = await db.query(
      `SELECT AVG(member_count) as avg FROM (
        SELECT COUNT(*) as member_count
        FROM circle_member cm
        JOIN circle c ON cm.circle_id = c.id
        WHERE c.valid = true
        GROUP BY cm.circle_id
      ) as circle_sizes`
    );
    const avg_circle_size = avgSizeResult.rows[0].avg ? parseFloat(avgSizeResult.rows[0].avg) : 0;

    res.json({
      total_users,
      total_circles,
      funds_circulating,
      avg_circle_size
    });
  }
  catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { user_token } = req.query;
    if (!user_token || user_token.length === 0) {
      return res.status(400).json({ error: 'User_token invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // verify user is system admin
    const userResult = await db.select('"user"', { id: user_id }, 'email');
    if (userResult[0].email !== 'admin@rosca-hei.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // get all users with their information
    const usersResult = await db.query(
      `SELECT
        u.id,
        u.username as name,
        u.email,
        (SELECT MAX(ut.id) FROM user_token ut WHERE ut.user_id = u.id) as last_login,
        (SELECT COUNT(*) FROM circle_member cm WHERE cm.user_id = u.id) as nbr_circles,
        (SELECT COUNT(*) > 0 FROM penalty p WHERE p.user_id = u.id AND p.waived = 0) as flaged
      FROM "user" u
      WHERE u.valid = true
      ORDER BY u.id`
    );
    const users = usersResult.rows.map(user => ({
      username: user.name,
      email: user.email,
      last_login: user.last_login,
      nbr_circles: parseInt(user.nbr_circles),
      flaged: user.flaged
    }));

    res.json({ users });
  }
  catch (err) {
    next(err);
  }
});

router.post('/deleteuser', async (req, res, next) => {
  try {
    const { user_token, email } = req.body;
    if (!user_token || !email) {
      return res.status(400).json({ error: 'User_token or Email invalid' });
    }

    // get admin user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const admin_user_id = tokenResult[0].user_id;

    // verify user is system admin
    const userResult = await db.select('"user"', { id: admin_user_id }, 'email');
    if (userResult[0].email !== 'admin@rosca-hei.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // toggle valid to false (modified_date updated by trigger)
    await db.update('"user"', { valid: false }, { email: email });

    res.json({ success: true, message: 'User deleted' });
  }
  catch (err) {
    next(err);
  }
});

router.get('/circles', async (req, res, next) => {
  try {
    const { user_token } = req.query;
    if (!user_token || user_token.length === 0) {
      return res.status(400).json({ error: 'User_token invalid' });
    }

    // get user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const user_id = tokenResult[0].user_id;

    // verify user is system admin
    const userResult = await db.select('"user"', { id: user_id }, 'email');
    if (userResult[0].email !== 'admin@rosca-hei.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // get all circles with their information
    const circlesResult = await db.query(
      `SELECT
        c.id,
        c.name as circle_name,
        (SELECT u.username FROM "user" u
         JOIN circle_member cm ON cm.user_id = u.id
         WHERE cm.circle_id = c.id AND cm.is_admin = true
         LIMIT 1) as creator,
        (SELECT COUNT(*) FROM circle_member cm WHERE cm.circle_id = c.id) as nbr_members,
        (SELECT COUNT(*) FROM period p
         JOIN cycle cy ON p.cycle_id = cy.id
         WHERE cy.circle_id = c.id) as progress,
        (SELECT SUM(cy.contribution_amount * (
          SELECT COUNT(*) FROM circle_member cm WHERE cm.circle_id = c.id
        ))
         FROM cycle cy WHERE cy.circle_id = c.id) as total_funds,
        (SELECT cy.auction_mode FROM cycle cy
         WHERE cy.circle_id = c.id
         ORDER BY cy.id DESC LIMIT 1) as mode
      FROM circle c
      WHERE c.valid = true
      ORDER BY c.id`
    );

    const circles = circlesResult.rows.map(circle => ({
      id: circle.id,
      circle_name: circle.circle_name,
      creator: circle.creator,
      nbr_members: parseInt(circle.nbr_members),
      progress: parseInt(circle.progress),
      total_funds: parseFloat(circle.total_funds),
      mode: circle.mode ? 'auction' : 'standard'
    }));

    res.json({ circles });
  }
  catch (err) {
    next(err);
  }
});

router.post('/deletecircle', async (req, res, next) => {
  try {
    const { user_token, circle_id } = req.body;
    if (!user_token || !circle_id) {
      return res.status(400).json({ error: 'User_token or Circle_id invalid' });
    }

    // get admin user_id from token
    const tokenResult = await db.select('user_token', { token: user_token }, 'user_id');
    const admin_user_id = tokenResult[0].user_id;

    // verify user is system admin
    const userResult = await db.select('"user"', { id: admin_user_id }, 'email');
    if (userResult[0].email !== 'admin@rosca-hei.com') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // toggle valid to false (modified_date updated by trigger)
    await db.update('circle', { valid: false }, { id: circle_id });

    res.json({ success: true, message: 'Circle deleted' });
  }
  catch (err) {
    next(err);
  }
});

module.exports = router;
