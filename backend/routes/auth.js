const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const mail = require('../utils/email.js')

router.get('/create', async (req, res, next) => {
  try {
    const { email, username, consent } = req.query;
    if (!email || !username || !consent) {
      return res.status(400).json({ error: 'Email, Username or Consent invalid' });
    }

    const user = await db.insert('"user"', { email: email, username: username, privacy_consent: consent });
    const user_token = await db.insert('user_token', { user_id: user.id })
    res.json({ user_token: user_token.token });
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

    const code = Math.floor(100000 + Math.random() * 900000);

    const expirationResult = await db.query(`SELECT CURRENT_TIMESTAMP + INTERVAL '5 minutes' as expiration;`);
    const expiration = expirationResult.rows[0].expiration;
    const users = await db.select('"user"', { email: email }, 'id');
    const user_id = users[0].id;
    await db.insert("authentification", { user_id: user_id, code: code, expiration: expiration })

    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ROSCA Authentication Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #171717 0%, #2d2d2d 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 3px;">ROSCA</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px; color: #171717; font-size: 24px; font-weight: 600;">Authentication Code</h2>
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                      Here is your verification code to access your ROSCA account. This code is valid for <strong>5 minutes</strong>.
                    </p>

                    <!-- Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 30px 0;">
                          <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 30px; display: inline-block; border: 2px solid #9333ea;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Code</p>
                            <p style="margin: 0; color: #171717; font-size: 48px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace; user-select: all;">${code}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      If you did not request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 30px 40px; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0 0 10px; color: #999999; font-size: 12px; text-align: center;">
                      This email was sent by ROSCA
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                      © 2025 ROSCA. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    await mail.sendEmail([email], `Your Authentication Code`, emailHTML);

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
