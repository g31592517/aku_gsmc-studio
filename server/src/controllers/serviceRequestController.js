const { pool } = require("../config/database");
const {
  sendServiceRequestEmail,
  sendRequesterConfirmationEmail,
  sendStatusUpdateEmail,
} = require("../services/emailService");

const ALLOWED_STATUSES = [
  "pending",
  "assigned",
  "in-progress",
  "awaiting-review",
  "completed",
  "declined",
];

// Resolves a service category name to its ID
async function resolveCategoryId(serviceName) {
  const [rows] = await pool.execute(
    "SELECT id FROM service_categories WHERE name = ?",
    [serviceName]
  );
  if (rows.length === 0) {
    throw new Error(`Unknown service category: ${serviceName}`);
  }
  return rows[0].id;
}

async function createServiceRequest(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const {
      userId,
      serviceType,
      projectVision,
      budgetRange,
      projectDeadline,
      additionalNotes,
    } = req.body;

    const categoryId = await resolveCategoryId(serviceType);

    await connection.beginTransaction();

    const [requestResult] = await connection.execute(
      `INSERT INTO service_requests
        (user_id, service_category_id, project_vision, budget_range, project_deadline, additional_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        categoryId,
        projectVision,
        budgetRange || null,
        projectDeadline || null,
        additionalNotes || null,
      ]
    );

    const newRequestId = requestResult.insertId;

    // Record the initial status in history
    await connection.execute(
      `INSERT INTO request_status_history
        (request_id, previous_status, new_status, changed_by_note)
       VALUES (?, NULL, 'pending', 'Request submitted by client')`,
      [newRequestId]
    );

    // Save any uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.execute(
          `INSERT INTO request_attachments
            (request_id, file_name, file_path, mime_type, file_size_bytes)
           VALUES (?, ?, ?, ?, ?)`,
          [newRequestId, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    await connection.commit();

    // Send email notifications in the background
    const [userRows] = await pool.execute(
      "SELECT email, contact_number FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      const attachmentFilenames = (req.files || []).map((f) => f.originalname);

      sendServiceRequestEmail({
        requesterEmail: user.email,
        contactNumber: user.contact_number,
        selectedService: serviceType,
        projectDescription: projectVision,
        budgetRange,
        projectDeadline,
        attachmentFilenames,
        submittedAt: new Date(),
      }).catch((err) => console.error("Internal request email failed:", err));

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
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

async function getRequestsByUser(req, res, next) {
  try {
    const { userId } = req.params;

    const [rows] = await pool.execute(
      `SELECT
         sr.id,
         sc.name AS service_type,
         sr.status,
         sr.budget_range,
         sr.project_deadline,
         sr.created_at,
         sr.updated_at
       FROM service_requests sr
       JOIN service_categories sc ON sc.id = sr.service_category_id
       WHERE sr.user_id = ?
       ORDER BY sr.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const includeNotes = req.query.includeNotes === "true";

    const [requestRows] = await pool.execute(
      `SELECT
         sr.*,
         sc.name AS service_type,
         u.email AS client_email,
         u.contact_number AS client_contact
       FROM service_requests sr
       JOIN service_categories sc ON sc.id = sr.service_category_id
       JOIN users u ON u.id = sr.user_id
       WHERE sr.id = ?`,
      [id]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const [attachments] = await pool.execute(
      `SELECT id, file_name, mime_type, file_size_bytes, uploaded_at
       FROM request_attachments
       WHERE request_id = ?`,
      [id]
    );

    const [statusHistory] = await pool.execute(
      `SELECT previous_status, new_status, changed_at, changed_by_note
       FROM request_status_history
       WHERE request_id = ?
       ORDER BY changed_at ASC`,
      [id]
    );

    const responseData = {
      ...requestRows[0],
      attachments,
      statusHistory,
    };

    if (includeNotes) {
      const [notes] = await pool.execute(
        `SELECT id, note_text, created_at
         FROM request_internal_notes
         WHERE request_id = ?
         ORDER BY created_at ASC`,
        [id]
      );
      responseData.internalNotes = notes;
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
}

async function getAllRequests(req, res, next) {
  try {
    const { status, serviceType, clientEmail } = req.query;

    let query = `
      SELECT
        sr.id,
        sc.name AS service_type,
        sr.status,
        sr.created_at,
        sr.updated_at,
        u.email AS client_email,
        u.contact_number AS client_contact
      FROM service_requests sr
      JOIN service_categories sc ON sc.id = sr.service_category_id
      JOIN users u ON u.id = sr.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += " AND sr.status = ?";
      params.push(status);
    }

    if (serviceType) {
      query += " AND sc.name = ?";
      params.push(serviceType);
    }

    if (clientEmail) {
      query += " AND u.email LIKE ?";
      params.push(`%${clientEmail}%`);
    }

    query += " ORDER BY sr.created_at DESC";

    const [rows] = await pool.execute(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function updateRequestStatus(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { newStatus, staffNote } = req.body;

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    await connection.beginTransaction();

    const [currentRows] = await connection.execute(
      "SELECT status, user_id FROM service_requests WHERE id = ?",
      [id]
    );

    if (currentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const previousStatus = currentRows[0].status;
    const userId = currentRows[0].user_id;

    await connection.execute(
      "UPDATE service_requests SET status = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, id]
    );

    await connection.execute(
      `INSERT INTO request_status_history
        (request_id, previous_status, new_status, changed_by_note)
       VALUES (?, ?, ?, ?)`,
      [id, previousStatus, newStatus, staffNote || null]
    );

    await connection.commit();

    // Notify the client by email
    const [userRows] = await pool.execute(
      "SELECT email FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length > 0) {
      sendStatusUpdateEmail({
        requesterEmail: userRows[0].email,
        requestId: id,
        newStatus,
      }).catch((err) => console.error("Status update email failed:", err));
    }

    res.json({
      success: true,
      message: "Status updated.",
      data: { requestId: id, previousStatus, newStatus },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

async function addInternalNote(req, res, next) {
  try {
    const { id } = req.params;
    const { noteText } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO request_internal_notes (request_id, note_text)
       VALUES (?, ?)`,
      [id, noteText.trim()]
    );

    const [noteRows] = await pool.execute(
      "SELECT id, note_text, created_at FROM request_internal_notes WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data: noteRows[0] });
  } catch (error) {
    next(error);
  }
}

async function getDashboardSummary(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'pending') AS pending,
         SUM(status = 'assigned') AS assigned,
         SUM(status = 'in-progress') AS in_progress,
         SUM(status = 'awaiting-review') AS awaiting_review,
         SUM(status = 'completed') AS completed
       FROM service_requests`
    );

    res.json({ success: true, data: rows[0] });
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
  getDashboardSummary,
};