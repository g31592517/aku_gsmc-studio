-- ─────────────────────────────────────────────────────────────────────────────
-- AKU GSMC Creative Services — Microsoft SQL Server Schema
--
-- Run via sqlcmd:
-- sqlcmd -S localhost,1433 -E -C -i src/db/schema.sql
--
-- Or paste directly into SQL Server Management Studio (SSMS).
-- Idempotent throughout — safe to re-run against an existing database.
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
    password_hash  NVARCHAR(255) NULL,        -- bcrypt hash; NULL only for legacy passwordless rows awaiting sign-up "claim"
    role_id        TINYINT       NOT NULL DEFAULT 1,
    is_active      BIT           NOT NULL DEFAULT 1,
    created_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES user_roles(id)
  );
END
GO

-- Seed staff accounts (password for both: 12345678)
-- Hash precomputed via: node -e "console.log(require('bcryptjs').hashSync('12345678', 10))"
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff1@gsmc.studio')
  INSERT INTO users (email, contact_number, role_id, password_hash)
  VALUES ('staff1@gsmc.studio', '+000000000000', 2, '$2b$10$/WKMCj987eXtLZMl3/iO1el/uoInHerdxxkwtlV2gC0xXLNrWr6iK');

IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff2@gsmc.studio')
  INSERT INTO users (email, contact_number, role_id, password_hash)
  VALUES ('staff2@gsmc.studio', '+000000000000', 2, '$2b$10$/WKMCj987eXtLZMl3/iO1el/uoInHerdxxkwtlV2gC0xXLNrWr6iK');
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

-- Categories added for the project brief wizard; retired in favour of the 6 above
-- but kept (never deleted) since service_requests rows may still reference them.
IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'videography')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Videography', 'videography', 'Video production booked via the project brief wizard', 7);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'photography')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Photography', 'photography', 'Photography booked via the project brief wizard', 8);

IF NOT EXISTS (SELECT 1 FROM service_categories WHERE slug = 'audio-editing')
  INSERT INTO service_categories (name, slug, description, display_order)
  VALUES ('Audio Editing', 'audio-editing', 'Audio editing booked via the project brief wizard', 9);
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
    is_deliverable   BIT           NOT NULL DEFAULT 0,  -- 0 = client-uploaded asset, 1 = staff-delivered final work
    uploaded_by      INT           NULL,                -- staff user who uploaded a deliverable (NULL for client uploads)
    uploaded_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_attachment_request
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,

    CONSTRAINT fk_attachment_uploaded_by
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
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


-- ─── INSPIRATION ASSETS ───────────────────────────────────────────────────────
-- Staff-managed content for the Inspiration gallery and Featured Work reel.
-- category is intentionally free-text, not an FK to service_categories: images
-- use the 6 service_categories.name values, while video content uses a
-- different, pre-existing taxonomy ("Podcast Production"/"Audio Production"/
-- "Video Production") that doesn't map cleanly onto the first.
IF OBJECT_ID('inspiration_assets', 'U') IS NULL
BEGIN
  CREATE TABLE inspiration_assets (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(200)   NULL,        -- NULL only for video (falls back to live YouTube oEmbed title client-side)
    description     NVARCHAR(MAX)   NULL,
    media_type      NVARCHAR(10)    NOT NULL,     -- 'image' | 'video'
    category        NVARCHAR(100)   NOT NULL,
    placement       NVARCHAR(20)    NOT NULL DEFAULT 'inspiration', -- 'inspiration' | 'featured_work' | 'both'
    youtube_id      NVARCHAR(20)    NULL,
    file_path       NVARCHAR(500)   NULL,         -- uploads-relative filename; required for images, optional for self-hosted videos
    mime_type       NVARCHAR(100)   NULL,
    file_size_bytes INT             NULL,
    is_published    BIT             NOT NULL DEFAULT 0,
    display_order   TINYINT         NOT NULL DEFAULT 0,
    created_by      INT             NULL,
    updated_by      INT             NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT fk_inspiration_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_inspiration_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT chk_inspiration_media_type CHECK (media_type IN ('image','video')),
    CONSTRAINT chk_inspiration_placement  CHECK (placement IN ('inspiration','featured_work','both')),
    CONSTRAINT chk_inspiration_title CHECK (media_type = 'video' OR title IS NOT NULL),
    CONSTRAINT chk_inspiration_media_source CHECK (
      (media_type = 'image' AND file_path IS NOT NULL) OR
      (media_type = 'video' AND (youtube_id IS NOT NULL OR file_path IS NOT NULL))
    )
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_inspiration_placement_published' AND object_id = OBJECT_ID('inspiration_assets'))
  CREATE INDEX idx_inspiration_placement_published ON inspiration_assets(placement, is_published);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_inspiration_category' AND object_id = OBJECT_ID('inspiration_assets'))
  CREATE INDEX idx_inspiration_category ON inspiration_assets(category);
GO

-- One-time seed migrating the previously-hardcoded Inspiration gallery images
-- and Featured Work / Inspiration video-pick YouTube content into the table.
-- Guarded on the table being empty so this only ever runs once.
IF NOT EXISTS (SELECT 1 FROM inspiration_assets)
BEGIN
  INSERT INTO inspiration_assets
    (title, description, media_type, category, placement, file_path, mime_type, is_published, display_order)
  VALUES
    ('Event Flyer Design', NULL,
     'image', 'Flyer & Poster Design', 'inspiration', '1787479428749-d715dff86456.jpeg', 'image/jpeg', 1, 1),
    ('Poster Series', NULL,
     'image', 'Flyer & Poster Design', 'inspiration', '1787479428758-10158835c123.jpeg', 'image/jpeg', 1, 2),
    ('Creative Poster Layouts', 'Visually compelling poster designs with strong typographic hierarchy.',
     'image', 'Flyer & Poster Design', 'inspiration', '1787479428761-7fea7a84380c.jpg', 'image/jpeg', 1, 3),

    ('Print Layout Portfolio', 'Professional print-ready layouts for brochures and collateral.',
     'image', 'Print & Publication Design', 'inspiration', '1787479428764-b66fd7103192.png', 'image/png', 1, 4),
    ('Publication Spread Design', 'Editorial spreads designed for readability and visual impact.',
     'image', 'Print & Publication Design', 'inspiration', '1787479428767-f21ea9a3b365.png', 'image/png', 1, 5),
    ('Magazine & Report Layouts', 'Clean, structured layouts for magazines, reports, and newsletters.',
     'image', 'Print & Publication Design', 'inspiration', '1787479428774-6015861ba919.png', 'image/png', 1, 6),

    ('Merchandise Mockup Collection', 'Branded merchandise concepts with realistic product mockups.',
     'image', 'Merchandise & Mockup Design', 'inspiration', '1787479428777-1ee748af4108.png', 'image/png', 1, 7),
    ('Apparel Branding Concepts', 'Custom apparel and merchandise designs for brand identity.',
     'image', 'Merchandise & Mockup Design', 'inspiration', '1787479428781-cf3364fa8da5.png', 'image/png', 1, 8),
    ('Product Mockup Showcase', 'Detailed product mockups for packaging and promotional items.',
     'image', 'Merchandise & Mockup Design', 'inspiration', '1787479428784-333e01588784.png', 'image/png', 1, 9),

    ('Motion Explainer Frames', 'Key visual frames from animated explainer video productions.',
     'image', 'Animated Explainer Videos', 'inspiration', '1787479428788-073a1220ab25.png', 'image/png', 1, 10),
    ('Animation Styleframes', 'Concept art and styleframes for short-form animated content.',
     'image', 'Animated Explainer Videos', 'inspiration', '1787479428791-79e08cc932b6.png', 'image/png', 1, 11),

    -- category fixed to match service_categories.name exactly (source used "Podcast Production (Video & Audio)")
    ('Podcast Studio Setup', 'Professional podcast recording and production environment.',
     'image', 'Podcast Production', 'inspiration', '1787479428793-96ef9e1437a7.jpeg', 'image/jpeg', 1, 12),

    ('Video Production Stills', 'Behind-the-scenes and key frames from video production projects.',
     'image', 'Professional Videography & Photography', 'inspiration', '1787479428795-29846df1ec07.jpeg', 'image/jpeg', 1, 13),
    ('Cinematic Photography', 'Professional photography work for events and brand storytelling.',
     'image', 'Professional Videography & Photography', 'inspiration', '1787479428797-9f6d726e00e7.jpeg', 'image/jpeg', 1, 14);

  -- title = NULL: live-fetched via YouTube oEmbed client-side, exactly as before migration.
  -- placement='both' for the 3 videos InspirationFeed.jsx also surfaced alongside Featured Work.
  INSERT INTO inspiration_assets
    (title, media_type, category, placement, youtube_id, is_published, display_order)
  VALUES
    (NULL, 'video', 'Podcast Production', 'featured_work', 'vFCZQL-MR4A', 1, 1),
    (NULL, 'video', 'Podcast Production', 'featured_work', 'IvzBM_vPh_A', 1, 2),
    (NULL, 'video', 'Podcast Production', 'both',          'iD_MjHRaZyM', 1, 3),
    (NULL, 'video', 'Podcast Production', 'featured_work', 'NgXfFtAGnVM', 1, 4),
    (NULL, 'video', 'Audio Production',   'featured_work', 'J5QSvej1bbM', 1, 5),
    (NULL, 'video', 'Audio Production',   'both',          'YopUhBbVkRc', 1, 6),
    (NULL, 'video', 'Video Production',   'both',          'NURtB7YDzKM', 1, 7),
    (NULL, 'video', 'Video Production',   'featured_work', '1O0e4Ar1kHI', 1, 8),
    (NULL, 'video', 'Video Production',   'featured_work', 'm0b-fMFh-UU', 1, 9),
    (NULL, 'video', 'Video Production',   'featured_work', 'E24imI3A_Ic', 1, 10),
    (NULL, 'video', 'Video Production',   'featured_work', '-xFqwizHCu4', 1, 11);
END
GO
