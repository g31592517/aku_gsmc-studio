const express = require("express");
const { param, body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const { getInspirationItems, toggleLike, toggleSave } = require("../controllers/inspirationController");

const router = express.Router();

router.get("/", getInspirationItems);

router.patch(
  "/:id/like",
  [param("id").isInt(), body("liked").isBoolean()],
  validateRequest,
  toggleLike
);

router.patch(
  "/:id/save",
  [param("id").isInt(), body("saved").isBoolean()],
  validateRequest,
  toggleSave
);

module.exports = router;
