const path = require("path");
const { sql, getPool } = require("../config/database");
const queries = require("../db/queries");
const {
  sendDraftReadyEmail,
  sendCompletedWorkEmail,
  sendDraftApprovedEmail,
  sendChangesRequestedEmail,
} = require("../services/emailService");

const SUBMISSION_TYPES = ["draft", "final"];
const REVIEW_DECISIONS = ["approve", "request_changes"];

async function assembleSubmissions(requestId) {
  const submissions = await queries.findSubmissionsByRequest(requestId);
  return Promise.all(
    submissions.map(async (submission) => ({
      ...submission,
      files: await queries.findSubmissionFilesBySubmission(submission.id),
    }))
  );
}

async function buildRequestDetailPayload(requestId) {
  const [request, attachments, statusHistory, submissions] = await Promise.all([
    queries.findRequestById(requestId),
    queries.findAttachmentsByRequest(requestId),
    queries.findStatusHistoryByRequest(requestId),
    assembleSubmissions(requestId),
  ]);

  return { ...request, attachments, statusHistory, submissions };
}

async function createSubmission(req, res, next) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const requestId = Number(req.params.id);
    const { submissionType, note } = req.body;

    if (!SUBMISSION_TYPES.includes(submissionType)) {
      return res.status(400).json({ success: false, message: "Invalid submission type." });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one file is required." });
    }

    await transaction.begin();

    const current = await queries.findCurrentRequestStatus(transaction, requestId);
    if (!current) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Enforced rule on the server side yenye ina alolow submission of final work unless the draft was approved already. 
    if (submissionType === "draft" && current.status_name !== "in-progress") {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Drafts can only be submitted while the request is in progress.",
      });
    }
    if (submissionType === "final" && current.status_name !== "draft-approved") {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "Final work can only be submitted after the client approves a draft.",
      });
    }

    const submissionId = await queries.insertSubmission(transaction, {
      requestId,
      submissionType,
      note: note || null,
      submittedBy: req.user.userId,
    });

    for (const file of req.files) {
      await queries.insertSubmissionFile(transaction, {
        submissionId,
        fileName: file.originalname,
        filePath: file.filename,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      });
    }

    const targetStatusName = submissionType === "draft" ? "awaiting-review" : "completed";
    const targetStatus = await queries.findStatusByName(targetStatusName);
    await queries.updateRequestStatusInDb(transaction, requestId, targetStatus.id);
    await queries.insertStatusHistoryEntry(transaction, {
      requestId,
      fromStatusId: current.status_id,
      toStatusId: targetStatus.id,
      changedBy: req.user.userId,
      note: note || (submissionType === "draft" ? "Draft submitted for review" : "Final work submitted"),
    });

    await transaction.commit();

    const client = await queries.findUserById(current.user_id);
    if (client) {
      const filenames = req.files.map((f) => f.originalname);
      if (submissionType === "draft") {
        sendDraftReadyEmail({
          requesterEmail: client.email,
          requestId,
          draftFilenames: filenames,
          note,
        }).catch((err) => console.error("Draft ready email failed:", err));
      } else {
        sendCompletedWorkEmail({
          requesterEmail: client.email,
          requestId,
          finalFilenames: filenames,
          note,
        }).catch((err) => console.error("Completed work email failed:", err));
      }
    }

    res.status(201).json({
      success: true,
      message: submissionType === "draft" ? "Draft submitted for client review." : "Final work submitted.",
      data: await buildRequestDetailPayload(requestId),
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const requestId = Number(req.params.id);

    const request = await queries.findRequestById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (req.user.role === "client" && Number(request.owner_user_id) !== Number(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You do not have permission to view these submissions." });
    }

    res.json({ success: true, data: await assembleSubmissions(requestId) });
  } catch (error) {
    next(error);
  }
}

async function reviewSubmission(req, res, next) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ success: false, message: "Only the client can review a draft." });
    }

    const requestId = Number(req.params.id);
    const submissionId = Number(req.params.submissionId);
    const { decision, feedbackNote } = req.body;

    if (!REVIEW_DECISIONS.includes(decision)) {
      return res.status(400).json({ success: false, message: "Invalid review decision." });
    }

    const request = await queries.findRequestById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (Number(request.owner_user_id) !== Number(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You do not have permission to review this request." });
    }

    await transaction.begin();

    const submission = await queries.findSubmissionById(transaction, submissionId);
    if (!submission || submission.request_id !== requestId) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    if (submission.submission_type !== "draft" || submission.approval_status !== "pending") {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: "This submission has already been reviewed." });
    }

    const current = await queries.findCurrentRequestStatus(transaction, requestId);
    if (!current || current.status_name !== "awaiting-review") {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: "This request is not awaiting review." });
    }

    const isApproval = decision === "approve";
    await queries.updateSubmissionApproval(transaction, submissionId, {
      approvalStatus: isApproval ? "approved" : "changes_requested",
      approvedBy: req.user.userId,
      feedbackNote: isApproval ? null : feedbackNote,
    });

    const targetStatus = await queries.findStatusByName(isApproval ? "draft-approved" : "in-progress");
    await queries.updateRequestStatusInDb(transaction, requestId, targetStatus.id);
    await queries.insertStatusHistoryEntry(transaction, {
      requestId,
      fromStatusId: current.status_id,
      toStatusId: targetStatus.id,
      changedBy: req.user.userId,
      note: isApproval ? "Client approved the draft" : `Client requested changes: ${feedbackNote || ""}`.trim(),
    });

    await transaction.commit();

    const staffMember = await queries.findUserById(submission.submitted_by);
    if (staffMember) {
      if (isApproval) {
        sendDraftApprovedEmail({ staffEmail: staffMember.email, requestId })
          .catch((err) => console.error("Draft approved email failed:", err));
      } else {
        sendChangesRequestedEmail({ staffEmail: staffMember.email, requestId, feedbackNote })
          .catch((err) => console.error("Changes requested email failed:", err));
      }
    }

    res.json({
      success: true,
      message: isApproval ? "Draft approved." : "Changes requested.",
      data: await buildRequestDetailPayload(requestId),
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function downloadSubmissionFile(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const fileId = Number(req.params.fileId);

    const file = await queries.findSubmissionFileById(fileId);
    if (!file || Number(file.request_id) !== requestId) {
      return res.status(404).json({ success: false, message: "File not found." });
    }
    if (req.user.role === "client" && Number(file.request_owner_id) !== Number(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You do not have permission to download this file." });
    }

    const absolutePath = path.join(__dirname, "../uploads", file.file_path);
    res.download(absolutePath, file.file_name, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSubmission,
  listSubmissions,
  reviewSubmission,
  downloadSubmissionFile,
};
