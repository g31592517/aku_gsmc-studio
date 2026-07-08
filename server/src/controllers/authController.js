const pool = require("../config/database");

async function signIn(req, res, next) {
  try {
    const { email, contactNumber } = req.body;

    const result = await pool.query(
      `INSERT INTO users (email, contact_number)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET contact_number = EXCLUDED.contact_number
       RETURNING id, email, contact_number, created_at`,
      [email.toLowerCase().trim(), contactNumber.trim()]
    );

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signIn };
