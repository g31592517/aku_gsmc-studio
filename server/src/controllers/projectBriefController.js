const pool = require("../config/database");
const {
  sendServiceRequestEmail,
  sendRequesterConfirmationEmail,
} = require("../services/emailService");

async function createProjectBrief(req, res, next) {
  const client = await pool.connect();

  try {
    const {
      serviceType,
      projectVision,
      clientName,
      clientEmail,
      budgetRange,
      projectDeadline,
      additionalNotes,
    } = req.body;

    await client.query("BEGIN");

    const briefResult = await client.query(
      `INSERT INTO project_briefs
        (service_type, project_vision, client_name, client_email, budget_range, project_deadline, additional_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        serviceType,
        projectVision,
        clientName,
        clientEmail,
        budgetRange,
        projectDeadline || null,
        additionalNotes || null,
      ]
    );

    const briefId = briefResult.rows[0].id;

    if (req.files && req.files.length > 0) {
      const insertAttachment = `
        INSERT INTO brief_attachments (brief_id, file_name, file_path, mime_type, file_size_bytes)
        VALUES ($1, $2, $3, $4, $5)
      `;

      for (const file of req.files) {
        await client.query(insertAttachment, [
          briefId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
        ]);
      }
    }

    await client.query("COMMIT");

    // Send emails after the transaction commits successfully.
    const attachmentFilenames = (req.files || []).map((f) => f.originalname);

    sendServiceRequestEmail({
      requesterEmail: clientEmail,
      contactNumber: req.body.contactNumber || "Not provided",
      selectedService: serviceType,
      projectDescription: projectVision,
      budgetRange: budgetRange,
      projectDeadline: projectDeadline,
      attachmentFilenames,
      submittedAt: new Date(),
    }).catch((err) => console.error("Failed to send internal request email:", err));

    sendRequesterConfirmationEmail({
      requesterEmail: clientEmail,
      selectedService: serviceType,
    }).catch((err) => console.error("Failed to send confirmation email:", err));

    res.status(201).json({
      success: true,
      message: "Project brief submitted successfully.",
      data: { briefId, createdAt: briefResult.rows[0].created_at },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

async function getProjectBriefs(req, res, next) {
  try {
    const { status } = req.query;

    const query = status
      ? "SELECT * FROM project_briefs WHERE status = $1 ORDER BY created_at DESC"
      : "SELECT * FROM project_briefs ORDER BY created_at DESC";

    const params = status ? [status] : [];
    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
}

async function getProjectBriefById(req, res, next) {
  try {
    const { id } = req.params;

    const briefResult = await pool.query(
      "SELECT * FROM project_briefs WHERE id = $1",
      [id]
    );

    if (briefResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Brief not found." });
    }

    const attachmentsResult = await pool.query(
      "SELECT id, file_name, mime_type, file_size_bytes, uploaded_at FROM brief_attachments WHERE brief_id = $1",
      [id]
    );

    res.json({
      success: true,
      data: { ...briefResult.rows[0], attachments: attachmentsResult.rows },
    });
  } catch (error) {
    next(error);
  }
}

async function updateBriefStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE project_briefs SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Brief not found." });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProjectBrief,
  getProjectBriefs,
  getProjectBriefById,
  updateBriefStatus,
};
