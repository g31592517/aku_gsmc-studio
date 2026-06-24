const express = require("express");
const { body, param, query } = require("express-validator");
const upload = require("../middleware/fileUpload");
const validateRequest = require("../middleware/validateRequest");
const {
  createProjectBrief,
  getProjectBriefs,
  getProjectBriefById,
  updateBriefStatus,
} = require("../controllers/projectBriefController");

const router = express.Router();

const ALLOWED_SERVICE_TYPES = ["videography", "photography", "audio-editing"];
const ALLOWED_STATUSES = ["pending", "reviewed", "in-progress", "completed", "declined"];

router.post(
  "/",
  upload.array("attachments", 10),
  [
    body("serviceType").isIn(ALLOWED_SERVICE_TYPES).withMessage("Invalid service type"),
    body("projectVision").trim().isLength({ min: 10 }).withMessage("Vision must be at least 10 characters"),
    body("clientName").trim().notEmpty().withMessage("Name is required"),
    body("clientEmail").isEmail().withMessage("A valid email is required"),
    body("budgetRange").trim().notEmpty().withMessage("Budget range is required"),
    body("projectDeadline").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid date format"),
  ],
  validateRequest,
  createProjectBrief
);

router.get(
  "/",
  [query("status").optional().isIn(ALLOWED_STATUSES)],
  validateRequest,
  getProjectBriefs
);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Invalid brief ID")],
  validateRequest,
  getProjectBriefById
);

router.patch(
  "/:id/status",
  [
    param("id").isInt().withMessage("Invalid brief ID"),
    body("status").isIn(ALLOWED_STATUSES).withMessage("Invalid status"),
  ],
  validateRequest,
  updateBriefStatus
);

module.exports = router;
