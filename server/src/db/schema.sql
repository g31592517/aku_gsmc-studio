

CREATE DATABASE IF NOT EXISTS 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aku_creative;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(150) NOT NULL UNIQUE,
  contact_number VARCHAR(30) NOT NULL,
  role        ENUM('client', 'staff', 'admin') NOT NULL DEFAULT 'client',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

.
CREATE TABLE IF NOT EXISTS service_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS service_requests (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  service_category_id INT UNSIGNED NOT NULL,
  project_vision    TEXT NOT NULL,
  budget_range      VARCHAR(50),
  project_deadline  DATE,
  additional_notes  TEXT,
  status            ENUM('pending','assigned','in-progress','awaiting-review','completed','declined')
                    NOT NULL DEFAULT 'pending',
  assigned_to       INT UNSIGNED,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_request_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_request_category
    FOREIGN KEY (service_category_id) REFERENCES service_categories(id),

  CONSTRAINT fk_request_assigned
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS request_attachments (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id       INT UNSIGNED NOT NULL,
  file_name        VARCHAR(255) NOT NULL,
  file_path        VARCHAR(500) NOT NULL,
  mime_type        VARCHAR(100) NOT NULL,
  file_size_bytes  INT UNSIGNED NOT NULL,
  uploaded_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_attachment_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS request_status_history (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id       INT UNSIGNED NOT NULL,
  previous_status  VARCHAR(50),
  new_status       VARCHAR(50) NOT NULL,
  changed_by_note  TEXT,
  changed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_history_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_internal_notes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id  INT UNSIGNED NOT NULL,
  author_id   INT UNSIGNED,
  note_text   TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_note_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,

  CONSTRAINT fk_note_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);


CREATE INDEX idx_requests_user_id      ON service_requests(user_id);
CREATE INDEX idx_requests_status       ON service_requests(status);
CREATE INDEX idx_requests_assigned_to  ON service_requests(assigned_to);
CREATE INDEX idx_attachments_request   ON request_attachments(request_id);
CREATE INDEX idx_history_request       ON request_status_history(request_id);
CREATE INDEX idx_notes_request         ON request_internal_notes(request_id);
CREATE INDEX idx_users_email           ON users(email);

INSERT INTO service_categories (name, description) VALUES
  ('Flyer & Poster Design',     'Event flyers, promotional posters and print-ready artwork'),
  ('Print & Publication Design','Booklets, newsletters, brochures and formal publications'),
  ('Merchandise & Mockup Design','Branded merchandise concepts and product mockups'),
  ('Animated Explainer Videos', 'Short animations for campaigns, education and communication'),
  ('Podcast Production',        'Full podcast production including video and audio editing'),
  ('Professional Videography & Photography', 'Event coverage, portraits, interviews and brand shoots')
ON DUPLICATE KEY UPDATE name = VALUES(name);
