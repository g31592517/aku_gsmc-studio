const express = require("express");
const { body, param, query } = require("express-validator");
const upload = require("../middleware/fileUpload");
const validateRequest = require("../middleware/validateRequest");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  createServiceRequest,
  getRequestsByUser,
  getRequestById,
  getAllRequests,
  updateRequestStatus,
  addInternalNote,
  uploadDeliverables,
  downloadAttachment,
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
router.get("/dashboard/summary", requireRole("staff", "admin"), getDashboardSummary);

// All requests with optional filters — staff only
router.get(
  "/",
  requireRole("staff", "admin"),
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
  requireAuth,
  [param("id").isInt().withMessage("Invalid request ID.")],
  validateRequest,
  getRequestById
);

// All requests for a specific user — client
router.get(
  "/user/:userId",
  requireAuth,
  [param("userId").isInt().withMessage("Invalid user ID.")],
  validateRequest,
  getRequestsByUser
);

// Submit a new service request — any signed-in user
router.post(
  "/",
  requireAuth,
  upload.array("attachments", 10),
  [
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
  requireRole("staff", "admin"),
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
  requireRole("staff", "admin"),
  [
    param("id").isInt().withMessage("Invalid request ID."),
    body("noteText").trim().notEmpty().withMessage("Note text cannot be empty."),
  ],
  validateRequest,
  addInternalNote
);

// Upload final deliverables + mark completed — staff only
router.post(
  "/:id/deliverables",
  requireRole("staff", "admin"),
  upload.array("deliverables", 10),
  [
    param("id").isInt().withMessage("Invalid request ID."),
    body("staffNote").optional().trim(),
  ],
  validateRequest,
  uploadDeliverables
);

// Download an attachment under its original filename — client (own request) and staff
router.get(
  "/:id/attachments/:attachmentId/download",
  requireAuth,
  [
    param("id").isInt().withMessage("Invalid request ID."),
    param("attachmentId").isInt().withMessage("Invalid attachment ID."),
  ],
  validateRequest,
  downloadAttachment
);

module.exports = router;
