const { upsertUser } = require("../db/queries");

async function signIn(req, res, next) {
  try {
    const { email, contactNumber } = req.body;
    const user = await upsertUser(
      email.toLowerCase().trim(),
      contactNumber.trim()
    );

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: {
        userId: user.id,
        email: user.email,
        contactNumber: user.contact_number,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signIn };
