const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const { signUp, signIn } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/sign-up",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail(),
    body("contactNumber")
      .trim()
      .notEmpty()
      .withMessage("Contact number is required.")
      .matches(/^\+?[\d\s\-().]{7,20}$/)
      .withMessage("Please enter a valid contact number."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  validateRequest,
  signUp
);

router.post(
  "/sign-in",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  signIn
);

module.exports = router;
