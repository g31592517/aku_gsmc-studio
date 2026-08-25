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
  downloadAttachment,
  getDashboardSummary,
} = require("../controllers/serviceRequestController");
const {
  createSubmission,
  listSubmissions,
  reviewSubmission,
  downloadSubmissionFile,
} = require("../controllers/requestSubmissionController");

const router = express.Router();

// All valid statuses — used for filtering/display (GET /).
const ALL_STATUSES = [
  "pending",
  "assigned",
  "in-progress",
  "awaiting-review",
  "draft-approved",
  "completed",
  "declined",
];

// Statuses staff may set directly via PATCH /:id/status. "awaiting-review",
// "draft-approved" and "completed" are deliberately excluded — those are only
// reachable through the draft/final submission and client-review endpoints
// below, so the approval workflow can't be bypassed by calling this endpoint
// directly (enforced here, not just hidden in the UI).
const MANUALLY_SETTABLE_STATUSES = ["pending", "assigned", "in-progress"];

// Dashboard summary — staff only
router.get("/dashboard/summary", requireRole("staff", "admin"), getDashboardSummary);

// All requests with optional filters — staff only
router.get(
  "/",
  requireRole("staff", "admin"),
  [
    query("status").optional().isIn(ALL_STATUSES),
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
      .isIn(MANUALLY_SETTABLE_STATUSES)
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

// Submit a draft or final work submission — staff only. The backend (not
// this route) enforces which submissionType is allowed for the request's
// current status — see requestSubmissionController.createSubmission.
router.post(
  "/:id/submissions",
  requireRole("staff", "admin"),
  upload.array("files", 10),
  [
    param("id").isInt().withMessage("Invalid request ID."),
    body("submissionType").isIn(["draft", "final"]).withMessage("Invalid submission type."),
    body("note").optional().trim(),
  ],
  validateRequest,
  createSubmission
);

// List submissions for a request — client (own request) and staff
router.get(
  "/:id/submissions",
  requireAuth,
  [param("id").isInt().withMessage("Invalid request ID.")],
  validateRequest,
  listSubmissions
);

// Client reviews a draft submission — client (own request) only
router.patch(
  "/:id/submissions/:submissionId/review",
  requireAuth,
  [
    param("id").isInt().withMessage("Invalid request ID."),
    param("submissionId").isInt().withMessage("Invalid submission ID."),
    body("decision").isIn(["approve", "request_changes"]).withMessage("Invalid decision."),
    body("feedbackNote").optional().trim(),
  ],
  validateRequest,
  reviewSubmission
);

// Download a submission file under its original filename — client (own request) and staff
router.get(
  "/:id/submissions/files/:fileId/download",
  requireAuth,
  [
    param("id").isInt().withMessage("Invalid request ID."),
    param("fileId").isInt().withMessage("Invalid file ID."),
  ],
  validateRequest,
  downloadSubmissionFile
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
