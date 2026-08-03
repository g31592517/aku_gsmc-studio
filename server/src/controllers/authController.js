const { pool } = require("../config/database");

async function signIn(req, res, next) {
  try {
    const { email, contactNumber } = req.body;
    const normalisedEmail = email.toLowerCase().trim();

    // Upsert — insert new user or update contact number if they return
    await pool.execute(
      `INSERT INTO users (email, contact_number)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE contact_number = VALUES(contact_number)`,
      [normalisedEmail, contactNumber.trim()]
    );

    const [rows] = await pool.execute(
      "SELECT id, email, contact_number, role, created_at FROM users WHERE email = ?",
      [normalisedEmail]
    );

    const user = rows[0];

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: {
        userId: user.id,
        email: user.email,
        contactNumber: user.contact_number,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signIn };