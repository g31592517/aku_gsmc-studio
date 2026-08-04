-- ─────────────────────────────────────────────────────────────────────────────
-- AKU GSMC Creative Services — Microsoft SQL Server Schema
--
-- Run via sqlcmd:
-- sqlcmd -S localhost -U sa -P your_password -i src/db/schema.sql
--
-- Or paste directly into SQL Server Management Studio (SSMS).
-- ─────────────────────────────────────────────────────────────────────────────

-- Create the database if it does not exist
IF NOT EXISTS (
  SELECT name FROM sys.databases WHERE name = N'aku_creative'
)
BEGIN
  CREATE DATABASE aku_creative
    COLLATE Latin1_General_CI_AS;
END
GO

USE aku_creative;
GO


-- ─── LOOKUP: USER ROLES ───────────────────────────────────────────────────────
IF OBJECT_ID('user_roles', 'U') IS NULL
BEGIN
  CREATE TABLE user_roles (
    id          TINYINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL,
    description NVARCHAR(255),
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_user_roles_name UNIQUE (name)
  );
END
GO

-- Seed roles (safe to re-run)
IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'client')
  INSERT INTO user_roles (name, description)
  VALUES ('client', 'External user who submits service requests');

IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'staff')
  INSERT INTO user_roles (name, description)
  VALUES ('staff', 'Graphics and Design team member who fulfils requests');

IF NOT EXISTS (SELECT 1 FROM user_roles WHERE name = 'admin')
  INSERT INTO user_roles (name, description)
  VALUES ('admin', 'System administrator with full access');
GO


-- ─── USERS ────────────────────────────────────────────────────────────────────
IF OBJECT_ID('users', 'U') IS NULL
BEGIN
  CREATE TABLE users (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    email          NVARCHAR(150) NOT NULL,
    contact_number NVARCHAR(30)  NOT NULL,
    role_id        TINYINT       NOT NULL DEFAULT 1,
    is_active      BIT           NOT NULL DEFAULT 1,
    created_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_users_email UNIQUE (email),

    CONSTRAINT fk_users_role
      FOREIGN KEY (role_id) REFERENCES user_roles(id)
  );
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users')
)
  CREATE INDEX idx_users_email   ON users(email);

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'idx_users_role_id' AND object_id = OBJECT_ID('users')
)
  CREATE INDEX idx_users_role_id ON users(role_id);
GO


-- ─── LOOKUP: REQUEST STATUSES ─────────────────────────────────────────────────
IF OBJECT_ID('request_statuses', 'U') IS NULL
BEGIN
  CREATE TABLE request_statuses (
    id          TINYINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL,
    label       NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    sort_order  TINYINT       NOT NULL DEFAULT 0,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_request_statuses_name UNIQUE (name)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'pending')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('pending', 'Pending', 'Request received and awaiting review', 1);

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'assigned')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('assigned', 'Assigned', 'Request assigned to a team member', 2);

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'in-progress')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('in-progress', 'In Progress', 'Work has started on the request', 3);

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'awaiting-review')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('awaiting-review', 'Awaiting Review', 'Work completed and awaiting client sign-off', 4);

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'completed')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('completed', 'Completed', 'Request fulfilled and closed', 5);

IF NOT EXISTS (SELECT 1 FROM request_statuses WHERE name = 'declined')
  INSERT INTO request_statuses (name, label, description, sort_order)
  VALUES ('declined', 'Declined', 'Request could not be fulfilled', 6);
GO


-- ─── SERVICE CATEGORIES ───────────────────────────────────────────────────────
IF OBJECT_ID('service_categories', 'U') IS NULL
BEGIN
  CREATE TABLE service_categories (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(100) NOT NULL,
    slug          NVARCHAR(100) NOT NULL,
    description   NVARCHAR(MAX),
    display_order TINYINT       NOT NULL DEFAULT 0,
    is_active     BIT           NOT NULL DEFAULT 1,
    created_at    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_service_categories_name UNIQUE (name),
    CONSTRAINT uq_service_categories_slug UNIQUE (slug)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'flyer-poster-design')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Flyer & Poster Design', 'flyer-poster-design',
          'Event flyers, promotional posters and print-ready artwork', 1);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'print-publication-design')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Print & Publication Design', 'print-publication-design',
          'Booklets, newsletters, brochures and formal publications', 2);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'merchandise-mockup-design')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Merchandise & Mockup Design', 'merchandise-mockup-design',
          'Branded merchandise concepts and product mockups', 3);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'animated-explainer-videos')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Animated Explainer Videos', 'animated-explainer-videos',
          'Short animations for campaigns, education and communication', 4);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'podcast-production')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Podcast Production', 'podcast-production',
          'Full podcast production including video and audio editing', 5);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'professional-videography-photography')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Professional Videography & Photography', 'professional-videography-photography',
          'Event coverage, portraits, interviews and brand shoots', 6);
GO


-- ─── SERVICE REQUESTS ─────────────────────────────────────────────────────────
IF OBJECT_ID('service_requests', 'U') IS NULL
BEGIN
  CREATE TABLE service_requests (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    user_id             INT     NOT NULL,
    service_category_id INT     NOT NULL,
    project_vision      NVARCHAR(MAX) NOT NULL,
    budget_range        NVARCHAR(50),
    project_deadline    DATE,
    additional_notes    NVARCHAR(MAX),
    status_id           TINYINT NOT NULL DEFAULT 1,
    assigned_to         INT,
    created_at          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_sr_user
      FOREIGN KEY (user_id)             REFERENCES users(id)              ON DELETE CASCADE,

    CONSTRAINT fk_sr_category
      FOREIGN KEY (service_category_id) REFERENCES service_categories(id),

    CONSTRAINT fk_sr_status
      FOREIGN KEY (status_id)           REFERENCES request_statuses(id),

    CONSTRAINT fk_sr_assigned
      FOREIGN KEY (assigned_to)         REFERENCES users(id)
  );
END
GO

-- SQL Server does not allow two FK columns referencing the same table
-- with CASCADE on both — assigned_to uses NO ACTION by default above.

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_sr_user_id'    AND object_id = OBJECT_ID('service_requests'))
  CREATE INDEX idx_sr_user_id    ON service_requests(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_sr_status_id'  AND object_id = OBJECT_ID('service_requests'))
  CREATE INDEX idx_sr_status_id  ON service_requests(status_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_sr_assigned'   AND object_id = OBJECT_ID('service_requests'))
  CREATE INDEX idx_sr_assigned   ON service_requests(assigned_to);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_sr_created_at' AND object_id = OBJECT_ID('service_requests'))
  CREATE INDEX idx_sr_created_at ON service_requests(created_at);
GO


-- ─── REQUEST ATTACHMENTS ──────────────────────────────────────────────────────
IF OBJECT_ID('request_attachments', 'U') IS NULL
BEGIN
  CREATE TABLE request_attachments (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    request_id       INT           NOT NULL,
    file_name        NVARCHAR(255) NOT NULL,
    file_path        NVARCHAR(500) NOT NULL,
    mime_type        NVARCHAR(100) NOT NULL,
    file_size_bytes  INT           NOT NULL,
    uploaded_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_attachment_request
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_attachments_request' AND object_id = OBJECT_ID('request_attachments'))
  CREATE INDEX idx_attachments_request ON request_attachments(request_id);
GO


-- ─── REQUEST STATUS HISTORY ───────────────────────────────────────────────────
IF OBJECT_ID('request_status_history', 'U') IS NULL
BEGIN
  CREATE TABLE request_status_history (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    request_id       INT     NOT NULL,
    from_status_id   TINYINT,
    to_status_id     TINYINT NOT NULL,
    changed_by       INT,
    note             NVARCHAR(MAX),
    changed_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_history_request
      FOREIGN KEY (request_id)     REFERENCES service_requests(id)  ON DELETE CASCADE,

    CONSTRAINT fk_history_from
      FOREIGN KEY (from_status_id) REFERENCES request_statuses(id),

    CONSTRAINT fk_history_to
      FOREIGN KEY (to_status_id)   REFERENCES request_statuses(id),

    CONSTRAINT fk_history_changed_by
      FOREIGN KEY (changed_by)     REFERENCES users(id)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_history_request' AND object_id = OBJECT_ID('request_status_history'))
  CREATE INDEX idx_history_request ON request_status_history(request_id);
GO


-- ─── INTERNAL NOTES ───────────────────────────────────────────────────────────
IF OBJECT_ID('request_internal_notes', 'U') IS NULL
BEGIN
  CREATE TABLE request_internal_notes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    request_id  INT           NOT NULL,
    author_id   INT,
    note_text   NVARCHAR(MAX) NOT NULL,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_note_request
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,

    CONSTRAINT fk_note_author
      FOREIGN KEY (author_id)  REFERENCES users(id)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notes_request' AND object_id = OBJECT_ID('request_internal_notes'))
  CREATE INDEX idx_notes_request ON request_internal_notes(request_id);
GO


-- ─── LOOKUP: NOTIFICATION TYPES ───────────────────────────────────────────────
IF OBJECT_ID('notification_types', 'U') IS NULL
BEGIN
  CREATE TABLE notification_types (
    id          TINYINT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_notification_types_name UNIQUE (name)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'request_received')
  INSERT INTO notification_types (name, description)
  VALUES ('request_received', 'Sent to client when their request is received');

IF NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'status_updated')
  INSERT INTO notification_types (name, description)
  VALUES ('status_updated', 'Sent to client when their request status changes');

IF NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'request_completed')
  INSERT INTO notification_types (name, description)
  VALUES ('request_completed', 'Sent to client when their request is marked complete');

IF NOT EXISTS (SELECT 1 FROM notification_types WHERE name = 'note_added')
  INSERT INTO notification_types (name, description)
  VALUES ('note_added', 'Internal alert when a note is added to a request');
GO


-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
IF OBJECT_ID('notifications', 'U') IS NULL
BEGIN
  CREATE TABLE notifications (
    id                   INT IDENTITY(1,1) PRIMARY KEY,
    recipient_id         INT     NOT NULL,
    notification_type_id TINYINT NOT NULL,
    request_id           INT,
    message              NVARCHAR(MAX) NOT NULL,
    is_read              BIT       NOT NULL DEFAULT 0,
    sent_at              DATETIME2,
    created_at           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_notification_recipient
      FOREIGN KEY (recipient_id)         REFERENCES users(id)              ON DELETE CASCADE,

    CONSTRAINT fk_notification_type
      FOREIGN KEY (notification_type_id) REFERENCES notification_types(id),

    CONSTRAINT fk_notification_request
      FOREIGN KEY (request_id)           REFERENCES service_requests(id)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_recipient' AND object_id = OBJECT_ID('notifications'))
  CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_read' AND object_id = OBJECT_ID('notifications'))
  CREATE INDEX idx_notifications_read ON notifications(is_read);
GO
