const pool = require("../config/database");
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
];

// Client submits a new service request
async function createServiceRequest(req, res, next) {
  const client = await pool.connect();

  try {
    const {
      userId,
      serviceType,
      projectVision,
      budgetRange,
      projectDeadline,
      additionalNotes,
    } = req.body;

    await client.query("BEGIN");

    // Insert the request
    const requestResult = await client.query(
      `INSERT INTO service_requests
        (user_id, service_type, project_vision, budget_range, project_deadline, additional_notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, created_at`,
      [
        userId,
        serviceType,
        projectVision,
        budgetRange || null,
        projectDeadline || null,
        additionalNotes || null,
      ]
    );

    const newRequest = requestResult.rows[0];

    // Record initial status in history
    await client.query(
      `INSERT INTO request_status_history
        (request_id, previous_status, new_status, changed_by_note)
       VALUES ($1, NULL, 'pending', 'Request submitted by client')`,
      [newRequest.id]
    );

    // Save any uploaded attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await client.query(
          `INSERT INTO request_attachments
            (request_id, file_name, file_path, mime_type, file_size_bytes)
           VALUES ($1, $2, $3, $4, $5)`,
          [newRequest.id, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    await client.query("COMMIT");

    // Fetch user details for email notifications
    const userResult = await pool.query(
      "SELECT email, contact_number FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];

    if (user) {
      const attachmentFilenames = (req.files || []).map((f) => f.originalname);

      sendServiceRequestEmail({
        requesterEmail: user.email,
        contactNumber: user.contact_number,
        selectedService: serviceType,
        projectDescription: projectVision,
        budgetRange,
        projectDeadline,
        attachmentFilenames,
        submittedAt: newRequest.created_at,
      }).catch((err) => console.error("Internal request email failed:", err));

      sendRequesterConfirmationEmail({
        requesterEmail: user.email,
        selectedService: serviceType,
      }).catch((err) => console.error("Confirmation email failed:", err));
    }

    res.status(201).json({
      success: true,
      message: "Service request submitted successfully.",
      data: { requestId: newRequest.id, status: newRequest.status },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

// Client fetches all their own requests
async function getRequestsByUser(req, res, next) {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
         sr.id,
         sr.service_type,
         sr.status,
         sr.budget_range,
         sr.project_deadline,
         sr.created_at,
         sr.updated_at
       FROM service_requests sr
       WHERE sr.user_id = $1
       ORDER BY sr.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// Client or staff fetches a single request — no internal notes for client
async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const { includeNotes } = req.query;

    const requestResult = await pool.query(
      `SELECT
         sr.*,
         u.email AS client_email,
         u.contact_number AS client_contact
       FROM service_requests sr
       JOIN users u ON u.id = sr.user_id
       WHERE sr.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const attachmentsResult = await pool.query(
      `SELECT id, file_name, mime_type, file_size_bytes, uploaded_at
       FROM request_attachments
       WHERE request_id = $1`,
      [id]
    );

    const historyResult = await pool.query(
      `SELECT previous_status, new_status, changed_at, changed_by_note
       FROM request_status_history
       WHERE request_id = $1
       ORDER BY changed_at ASC`,
      [id]
    );

    const responseData = {
      ...requestResult.rows[0],
      attachments: attachmentsResult.rows,
      statusHistory: historyResult.rows,
    };

    // Internal notes are only included when the staff dashboard requests them
    if (includeNotes === "true") {
      const notesResult = await pool.query(
        `SELECT id, note_text, created_at
         FROM request_internal_notes
         WHERE request_id = $1
         ORDER BY created_at ASC`,
        [id]
      );
      responseData.internalNotes = notesResult.rows;
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
}

// Staff fetches all requests with optional filters
async function getAllRequests(req, res, next) {
  try {
    const { status, serviceType, clientEmail } = req.query;

    let query = `
      SELECT
        sr.id,
        sr.service_type,
        sr.status,
        sr.created_at,
        sr.updated_at,
        u.email AS client_email,
        u.contact_number AS client_contact
      FROM service_requests sr
      JOIN users u ON u.id = sr.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      params.push(status);
      query += ` AND sr.status = $${params.length}`;
    }

    if (serviceType) {
      params.push(serviceType);
      query += ` AND sr.service_type = $${params.length}`;
    }

    if (clientEmail) {
      params.push(`%${clientEmail}%`);
      query += ` AND u.email ILIKE $${params.length}`;
    }

    query += " ORDER BY sr.created_at DESC";

    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

// Staff updates the status of a request
async function updateRequestStatus(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { newStatus, staffNote } = req.body;

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    await client.query("BEGIN");

    // Get the current status before updating
    const currentResult = await client.query(
      "SELECT status, user_id FROM service_requests WHERE id = $1",
      [id]
    );

    if (currentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const previousStatus = currentResult.rows[0].status;
    const userId = currentResult.rows[0].user_id;

    // Update the request
    await client.query(
      `UPDATE service_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newStatus, id]
    );

    // Record the status change in history
    await client.query(
      `INSERT INTO request_status_history
        (request_id, previous_status, new_status, changed_by_note)
       VALUES ($1, $2, $3, $4)`,
      [id, previousStatus, newStatus, staffNote || null]
    );

    await client.query("COMMIT");

    // Notify the client of the status change
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length > 0) {
      sendStatusUpdateEmail({
        requesterEmail: userResult.rows[0].email,
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
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

// Staff adds an internal note to a request
async function addInternalNote(req, res, next) {
  try {
    const { id } = req.params;
    const { noteText } = req.body;

    const result = await pool.query(
      `INSERT INTO request_internal_notes (request_id, note_text)
       VALUES ($1, $2)
       RETURNING id, note_text, created_at`,
      [id, noteText.trim()]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

// Dashboard summary counts for the staff overview
async function getDashboardSummary(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'assigned') AS assigned,
         COUNT(*) FILTER (WHERE status = 'in-progress') AS in_progress,
         COUNT(*) FILTER (WHERE status = 'awaiting-review') AS awaiting_review,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed
       FROM service_requests`
    );

    res.json({ success: true, data: result.rows[0] });
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
