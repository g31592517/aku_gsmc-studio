const bcrypt = require("bcryptjs");
const { findUserByEmail, insertUserWithPassword, setUserPassword } = require("../db/queries");
const { signAuthToken } = require("../utils/jwt");

const SALT_ROUNDS = 10;

function toAuthResponse(user, token) {
  return {
    userId: user.id,
    email: user.email,
    contactNumber: user.contact_number,
    role: user.role,
    token,
  };
}

async function signUp(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const contactNumber = req.body.contactNumber.trim();
    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    let user = await findUserByEmail(email);

    if (user && user.password_hash) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    if (user && !user.password_hash) {
      // Legacy passwordless account — claim it by setting a password now.
      await setUserPassword(user.id, passwordHash);
      user = await findUserByEmail(email);
    } else {
      user = await insertUserWithPassword({ email, contactNumber, passwordHash });
    }

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: "Account created.",
      data: toAuthResponse(user, token),
    });
  } catch (error) {
    next(error);
  }
}

async function signIn(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await findUserByEmail(email);

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (Number(user.is_active) === 0) {
      return res.status(403).json({ success: false, message: "This account has been deactivated." });
    }

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: toAuthResponse(user, token),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signUp, signIn };
