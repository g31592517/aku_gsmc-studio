const { sql, getPool } = require("../config/database");


// Returns a new mssql Request attached to the pool.
async function createRequest() {
  const pool = await getPool();
  return pool.request();
}

// USERS 

async function findUserByEmail(email) {
  const result = await (await createRequest())
    .input("email", sql.NVarChar(150), email)
    .query(`
      SELECT u.id, u.email, u.contact_number, u.password_hash,
             u.role_id, u.is_active, r.name AS role
      FROM   users u
      JOIN   user_roles r ON r.id = u.role_id
      WHERE  u.email = @email
    `);

  return result.recordset[0] || null;
}

async function insertUserWithPassword({ email, contactNumber, passwordHash, roleId = 1 }) {
  await (await createRequest())
    .input("email", sql.NVarChar(150), email)
    .input("contactNumber", sql.NVarChar(30), contactNumber)
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .input("roleId", sql.TinyInt, roleId)
    .query(`
      INSERT INTO users (email, contact_number, password_hash, role_id)
      VALUES (@email, @contactNumber, @passwordHash, @roleId)
    `);

  return findUserByEmail(email);
}

async function setUserPassword(userId, passwordHash) {
  await (await createRequest())
    .input("id", sql.Int, userId)
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE users
      SET    password_hash = @passwordHash, updated_at = SYSUTCDATETIME()
      WHERE  id = @id
    `);
}

// LOOKUPS 

async function findStatusByName(statusName) {
  const result = await (await createRequest())
    .input("name", sql.NVarChar(50), statusName)
    .query("SELECT id, name, label FROM request_statuses WHERE name = @name");

  return result.recordset[0] || null;
}

async function findCategoryByName(categoryName) {
  const result = await (await createRequest())
    .input("name", sql.NVarChar(100), categoryName)
    .query("SELECT id, name, slug FROM service_categories WHERE name = @name");

  return result.recordset[0] || null;
}

async function getAllStatuses() {
  const result = await (await createRequest())
    .query(`
      SELECT id, name, label, sort_order
      FROM   request_statuses
      ORDER  BY sort_order ASC
    `);

  return result.recordset;
}

async function getAllCategories() {
  const result = await (await createRequest())
    .query(`
      SELECT id, name, slug, description, display_order
      FROM   service_categories
      WHERE  is_active = 1
      ORDER  BY display_order ASC
    `);

  return result.recordset;
}

//  SERVICE REQUESTS 
async function insertServiceRequest(transaction, {
  userId, categoryId, projectVision,
  budgetRange, projectDeadline, additionalNotes, statusId,
}) {
  const request = transaction.request();

  const result = await request
    .input("userId",        sql.Int,           userId)
    .input("categoryId",   sql.Int,           categoryId)
    .input("vision",       sql.NVarChar(sql.MAX), projectVision)
    .input("budget",       sql.NVarChar(50),  budgetRange  || null)
    .input("deadline",     sql.Date,          projectDeadline || null)
    .input("notes",        sql.NVarChar(sql.MAX), additionalNotes || null)
    .input("statusId",     sql.TinyInt,       statusId)
    .query(`
      INSERT INTO service_requests
        (user_id, service_category_id, project_vision,
         budget_range, project_deadline, additional_notes, status_id)
      OUTPUT INSERTED.id
      VALUES
        (@userId, @categoryId, @vision,
         @budget, @deadline, @notes, @statusId)
    `);

  return result.recordset[0].id;
}

async function insertStatusHistoryEntry(transaction, {
  requestId, fromStatusId, toStatusId, changedBy, note,
}) {
  await transaction.request()
    .input("requestId",    sql.Int,           requestId)
    .input("fromStatusId", sql.TinyInt,       fromStatusId || null)
    .input("toStatusId",   sql.TinyInt,       toStatusId)
    .input("changedBy",    sql.Int,           changedBy || null)
    .input("note",         sql.NVarChar(sql.MAX), note || null)
    .query(`
      INSERT INTO request_status_history
        (request_id, from_status_id, to_status_id, changed_by, note)
      VALUES
        (@requestId, @fromStatusId, @toStatusId, @changedBy, @note)
    `);
}

async function insertAttachment(transaction, {
  requestId, fileName, filePath, mimeType, fileSizeBytes,
  isDeliverable = false, uploadedBy = null,
}) {
  await transaction.request()
    .input("requestId",      sql.Int,          requestId)
    .input("fileName",       sql.NVarChar(255), fileName)
    .input("filePath",       sql.NVarChar(500), filePath)
    .input("mimeType",       sql.NVarChar(100), mimeType)
    .input("fileSizeBytes",  sql.Int,           fileSizeBytes)
    .input("isDeliverable",  sql.Bit,           isDeliverable)
    .input("uploadedBy",     sql.Int,           uploadedBy)
    .query(`
      INSERT INTO request_attachments
        (request_id, file_name, file_path, mime_type, file_size_bytes, is_deliverable, uploaded_by)
      VALUES
        (@requestId, @fileName, @filePath, @mimeType, @fileSizeBytes, @isDeliverable, @uploadedBy)
    `);
}

async function findRequestsByUser(userId) {
  const result = await (await createRequest())
    .input("userId", sql.Int, userId)
    .query(`
      SELECT
        sr.id,
        sc.name      AS service_type,
        rs.name      AS status,
        rs.label     AS status_label,
        sr.budget_range,
        sr.project_deadline,
        sr.created_at,
        sr.updated_at
      FROM   service_requests   sr
      JOIN   service_categories sc ON sc.id = sr.service_category_id
      JOIN   request_statuses   rs ON rs.id = sr.status_id
      WHERE  sr.user_id = @userId
      ORDER  BY sr.created_at DESC
    `);

  return result.recordset;
}

async function findRequestById(requestId) {
  const result = await (await createRequest())
    .input("id", sql.Int, requestId)
    .query(`
      SELECT
        sr.id,
        sr.user_id     AS owner_user_id,
        sr.project_vision,
        sr.budget_range,
        sr.project_deadline,
        sr.additional_notes,
        sr.created_at,
        sr.updated_at,
        sc.name        AS service_type,
        sc.slug        AS service_slug,
        rs.name        AS status,
        rs.label       AS status_label,
        u.email        AS client_email,
        u.contact_number AS client_contact,
        au.email       AS assigned_to_email
      FROM   service_requests   sr
      JOIN   service_categories sc ON sc.id  = sr.service_category_id
      JOIN   request_statuses   rs ON rs.id  = sr.status_id
      JOIN   users              u  ON u.id   = sr.user_id
      LEFT JOIN users           au ON au.id  = sr.assigned_to
      WHERE  sr.id = @id
    `);

  return result.recordset[0] || null;
}

async function findAllRequests({ status, serviceType, clientEmail }) {
  const request = await createRequest();

  let query = `
    SELECT
      sr.id,
      sc.name          AS service_type,
      rs.name          AS status,
      rs.label         AS status_label,
      sr.created_at,
      sr.updated_at,
      u.email          AS client_email,
      u.contact_number AS client_contact
    FROM   service_requests   sr
    JOIN   service_categories sc ON sc.id = sr.service_category_id
    JOIN   request_statuses   rs ON rs.id = sr.status_id
    JOIN   users              u  ON u.id  = sr.user_id
    WHERE  1 = 1
  `;

  if (status) {
    request.input("status", sql.NVarChar(50), status);
    query += " AND rs.name = @status";
  }

  if (serviceType) {
    request.input("serviceType", sql.NVarChar(100), serviceType);
    query += " AND sc.name = @serviceType";
  }

  if (clientEmail) {
    request.input("clientEmail", sql.NVarChar(150), `%${clientEmail}%`);
    query += " AND u.email LIKE @clientEmail";
  }

  query += " ORDER BY sr.created_at DESC";

  const result = await request.query(query);
  return result.recordset;
}

async function findAttachmentsByRequest(requestId) {
  const result = await (await createRequest())
    .input("requestId", sql.Int, requestId)
    .query(`
      SELECT id, file_name, mime_type, file_size_bytes, is_deliverable, uploaded_at
      FROM   request_attachments
      WHERE  request_id = @requestId
    `);

  return result.recordset;
}

async function findAttachmentById(attachmentId) {
  const result = await (await createRequest())
    .input("id", sql.Int, attachmentId)
    .query(`
      SELECT ra.id, ra.request_id, ra.file_name, ra.file_path, ra.mime_type,
             sr.user_id AS request_owner_id
      FROM   request_attachments ra
      JOIN   service_requests    sr ON sr.id = ra.request_id
      WHERE  ra.id = @id
    `);

  return result.recordset[0] || null;
}

async function findStatusHistoryByRequest(requestId) {
  const result = await (await createRequest())
    .input("requestId", sql.Int, requestId)
    .query(`
      SELECT
        fs.name  AS previous_status,
        fs.label AS previous_status_label,
        ts.name  AS new_status,
        ts.label AS new_status_label,
        rsh.note,
        rsh.changed_at
      FROM       request_status_history rsh
      LEFT JOIN  request_statuses       fs ON fs.id = rsh.from_status_id
      JOIN       request_statuses       ts ON ts.id = rsh.to_status_id
      WHERE      rsh.request_id = @requestId
      ORDER BY   rsh.changed_at ASC
    `);

  return result.recordset;
}

async function findInternalNotesByRequest(requestId) {
  const result = await (await createRequest())
    .input("requestId", sql.Int, requestId)
    .query(`
      SELECT
        n.id,
        n.note_text,
        n.created_at,
        u.email AS author_email
      FROM      request_internal_notes n
      LEFT JOIN users                  u ON u.id = n.author_id
      WHERE     n.request_id = @requestId
      ORDER BY  n.created_at ASC
    `);

  return result.recordset;
}

async function findCurrentRequestStatus(transaction, requestId) {
  const result = await transaction.request()
    .input("id", sql.Int, requestId)
    .query(`
      SELECT sr.status_id, rs.name AS status_name, sr.user_id
      FROM   service_requests sr
      JOIN   request_statuses rs ON rs.id = sr.status_id
      WHERE  sr.id = @id
    `);

  return result.recordset[0] || null;
}

async function updateRequestStatusInDb(transaction, requestId, toStatusId) {
  await transaction.request()
    .input("statusId",  sql.TinyInt, toStatusId)
    .input("requestId", sql.Int,     requestId)
    .query(`
      UPDATE service_requests
      SET    status_id  = @statusId,
             updated_at = SYSUTCDATETIME()
      WHERE  id = @requestId
    `);
}

async function insertInternalNote(requestId, noteText, authorId) {
  const insertResult = await (await createRequest())
    .input("requestId", sql.Int,                requestId)
    .input("noteText",  sql.NVarChar(sql.MAX),  noteText)
    .input("authorId",  sql.Int,                authorId || null)
    .query(`
      INSERT INTO request_internal_notes (request_id, note_text, author_id)
      OUTPUT INSERTED.id
      VALUES (@requestId, @noteText, @authorId)
    `);

  const noteId = insertResult.recordset[0].id;

  const noteResult = await (await createRequest())
    .input("id", sql.Int, noteId)
    .query(`
      SELECT n.id, n.note_text, n.created_at, u.email AS author_email
      FROM      request_internal_notes n
      LEFT JOIN users                  u ON u.id = n.author_id
      WHERE     n.id = @id
    `);

  return noteResult.recordset[0];
}

async function getDashboardCounts() {
  const result = await (await createRequest())
    .query(`
      SELECT
        COUNT(*)                                          AS total,
        SUM(CASE WHEN rs.name = 'pending'         THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN rs.name = 'assigned'        THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN rs.name = 'in-progress'     THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN rs.name = 'awaiting-review' THEN 1 ELSE 0 END) AS awaiting_review,
        SUM(CASE WHEN rs.name = 'completed'       THEN 1 ELSE 0 END) AS completed
      FROM service_requests sr
      JOIN request_statuses rs ON rs.id = sr.status_id
    `);

  return result.recordset[0];
}

async function findUserById(userId) {
  const result = await (await createRequest())
    .input("id", sql.Int, userId)
    .query(`
      SELECT id, email, contact_number
      FROM   users
      WHERE  id = @id
    `);

  return result.recordset[0] || null;
}

module.exports = {
  findUserByEmail,
  insertUserWithPassword,
  setUserPassword,
  findStatusByName,
  findCategoryByName,
  getAllStatuses,
  getAllCategories,
  insertServiceRequest,
  insertStatusHistoryEntry,
  insertAttachment,
  findRequestsByUser,
  findRequestById,
  findAllRequests,
  findAttachmentsByRequest,
  findAttachmentById,
  findStatusHistoryByRequest,
  findInternalNotesByRequest,
  findCurrentRequestStatus,
  updateRequestStatusInDb,
  insertInternalNote,
  getDashboardCounts,
  findUserById,
};
