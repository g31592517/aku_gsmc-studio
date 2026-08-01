const express = require("express");
const { body, param, query } = require("express-validator");
const upload = require("../middleware/fileUpload");
const validateRequest = require("../middleware/validateRequest");
const {
  createServiceRequest,
  getRequestsByUser,
  getRequestById,
  getAllRequests,
  updateRequestStatus,
  addInternalNote,
  getDashboardSummary,
} = require("../controllers/serviceRequestController");

const router = express.Router();

const ALLOWED_STATUSES = [
  "pending",
  "assigned",
  "in-progress",
  "awaiting-review",
  "completed",
];

// Dashboard summary — staff only
router.get("/dashboard/summary", getDashboardSummary);

// All requests with optional filters — staff only
router.get(
  "/",
  [
    query("status").optional().isIn(ALLOWED_STATUSES),
    query("serviceType").optional().trim(),
    query("clientEmail").optional().trim(),
  ],
  validateRequest,
  getAllRequests
);

// Single request by ID — client and staff
router.get(
  "/:id",
  [param("id").isInt().withMessage("Invalid request ID.")],
  validateRequest,
  getRequestById
);

// All requests for a specific user — client
router.get(
  "/user/:userId",
  [param("userId").isInt().withMessage("Invalid user ID.")],
  validateRequest,
  getRequestsByUser
);

// Submit a new service request — client
router.post(
  "/",
  upload.array("attachments", 10),
  [
    body("userId").isInt().withMessage("A valid user ID is required."),
    body("serviceType").trim().notEmpty().withMessage("Service type is required."),
    body("projectVision")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please describe your project in at least 10 characters."),
    body("projectDeadline")
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage("Invalid date format."),
  ],
  validateRequest,
  createServiceRequest
);

// Update request status — staff only
router.patch(
  "/:id/status",
  [
    param("id").isInt().withMessage("Invalid request ID."),
    body("newStatus")
      .isIn(ALLOWED_STATUSES)
      .withMessage("Invalid status value."),
    body("staffNote").optional().trim(),
  ],
  validateRequest,
  updateRequestStatus
);

// Add internal note — staff only
router.post(
  "/:id/notes",
  [
    param("id").isInt().withMessage("Invalid request ID."),
    body("noteText").trim().notEmpty().withMessage("Note text cannot be empty."),
  ],
  validateRequest,
  addInternalNote
);

module.exports = router;
