const pool = require("../config/database");

async function subscribe(req, res, next) {
  try {
    const { email } = req.body;

    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, message: "You're already subscribed." });
    }

    res.status(201).json({ success: true, message: "Subscribed successfully.", data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = { subscribe };
