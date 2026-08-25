const path = require("path");
const { sql, getPool } = require("../config/database");
const queries = require("../db/queries");
const {
  sendServiceRequestEmail,
  sendRequesterConfirmationEmail,
  sendStatusUpdateEmail,
} = require("../services/emailService");

async function createServiceRequest(req, res, next) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const userId = req.user.userId;
    const {
      serviceType, projectVision,
      budgetRange, projectDeadline, additionalNotes,
    } = req.body;

    const category = await queries.findCategoryByName(serviceType);
    if (!category) {
      return res.status(400).json({ success: false, message: "Unknown service category." });
    }

    const pendingStatus = await queries.findStatusByName("pending");

    await transaction.begin();

    const newRequestId = await queries.insertServiceRequest(transaction, {
      userId, categoryId: category.id, projectVision,
      budgetRange, projectDeadline, additionalNotes,
      statusId: pendingStatus.id,
    });

    await queries.insertStatusHistoryEntry(transaction, {
      requestId: newRequestId,
      fromStatusId: null,
      toStatusId: pendingStatus.id,
      changedBy: null,
      note: "Request submitted by client",
    });

    for (const file of req.files || []) {
      await queries.insertAttachment(transaction, {
        requestId: newRequestId,
        fileName: file.originalname,
        filePath: file.filename,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      });
    }

    await transaction.commit();

    const user = await queries.findUserById(userId);
    if (user) {
      const attachmentFilenames = (req.files || []).map((f) => f.originalname);

      sendServiceRequestEmail({
        requesterEmail: user.email,
        contactNumber: user.contact_number,
        selectedService: serviceType,
        projectDescription: projectVision,
        budgetRange, projectDeadline,
        attachmentFilenames,
        submittedAt: new Date(),
      }).catch((err) => console.error("Internal email failed:", err));

      sendRequesterConfirmationEmail({
        requesterEmail: user.email,
        selectedService: serviceType,
      }).catch((err) => console.error("Confirmation email failed:", err));
    }

    res.status(201).json({
      success: true,
      message: "Service request submitted successfully.",
      data: { requestId: newRequestId, status: "pending" },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function getRequestsByUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    if (req.user.role === "client" && Number(req.user.userId) !== userId) {
      return res.status(403).json({ success: false, message: "You do not have permission to view these requests." });
    }
    const rows = await queries.findRequestsByUser(userId);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const includeNotes = req.query.includeNotes === "true";

    const request = await queries.findRequestById(Number(id));
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (req.user.role === "client" && Number(request.owner_user_id) !== Number(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You do not have permission to view this request." });
    }

    const [attachments, statusHistory] = await Promise.all([
      queries.findAttachmentsByRequest(Number(id)),
      queries.findStatusHistoryByRequest(Number(id)),
    ]);

    const responseData = { ...request, attachments, statusHistory };

    if (includeNotes) {
      responseData.internalNotes = await queries.findInternalNotesByRequest(Number(id));
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
}

async function getAllRequests(req, res, next) {
  try {
    const rows = await queries.findAllRequests(req.query);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function updateRequestStatus(req, res, next) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    const { id } = req.params;
    const { newStatus, staffNote } = req.body;

    const toStatus = await queries.findStatusByName(newStatus);
    if (!toStatus) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    await transaction.begin();

    const current = await queries.findCurrentRequestStatus(transaction, Number(id));
    if (!current) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    await queries.updateRequestStatusInDb(transaction, Number(id), toStatus.id);

    await queries.insertStatusHistoryEntry(transaction, {
      requestId: Number(id),
      fromStatusId: current.status_id,
      toStatusId: toStatus.id,
      changedBy: req.user.userId,
      note: staffNote || null,
    });

    await transaction.commit();

    const user = await queries.findUserById(current.user_id);
    if (user) {
      sendStatusUpdateEmail({
        requesterEmail: user.email,
        requestId: id,
        newStatus,
      }).catch((err) => console.error("Status update email failed:", err));
    }

    res.json({
      success: true,
      message: "Status updated.",
      data: { requestId: id, previousStatus: current.status_name, newStatus },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

async function addInternalNote(req, res, next) {
  try {
    const note = await queries.insertInternalNote(
      Number(req.params.id),
      req.body.noteText.trim(),
      req.user.userId
    );
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
}

async function downloadAttachment(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const attachmentId = Number(req.params.attachmentId);

    const attachment = await queries.findAttachmentById(attachmentId);
    if (!attachment || Number(attachment.request_id) !== requestId) {
      return res.status(404).json({ success: false, message: "Attachment not found." });
    }

    if (req.user.role === "client" && Number(attachment.request_owner_id) !== Number(req.user.userId)) {
      return res.status(403).json({ success: false, message: "You do not have permission to download this file." });
    }

    const absolutePath = path.join(__dirname, "../uploads", attachment.file_path);
    res.download(absolutePath, attachment.file_name, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (error) {
    next(error);
  }
}

async function getDashboardSummary(req, res, next) {
  try {
    const counts = await queries.getDashboardCounts();
    res.json({ success: true, data: counts });
  } catch (error) {
    next(error);
  }
}

async function getServiceCategories(req, res, next) {
  try {
    res.json({ success: true, data: await queries.getAllCategories() });
  } catch (error) {
    next(error);
  }
}

async function getRequestStatuses(req, res, next) {
  try {
    res.json({ success: true, data: await queries.getAllStatuses() });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createServiceRequest,
  getRequestsByUser,
  getRequestById,
  getAllRequests,
  updateRequestStatus,
  addInternalNote,
  downloadAttachment,
  getDashboardSummary,
  getServiceCategories,
  getRequestStatuses,
};
