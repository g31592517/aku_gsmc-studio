const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const { subscribe } = require("../controllers/newsletterController");

const router = express.Router();

router.post(
  "/subscribe",
  [body("email").isEmail().withMessage("A valid email is required")],
  validateRequest,
  subscribe
);

module.exports = router;
