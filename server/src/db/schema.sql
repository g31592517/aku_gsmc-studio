-- Project briefs submitted via the multi-step form
CREATE TABLE IF NOT EXISTS project_briefs (
  id SERIAL PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  project_vision TEXT NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  client_email VARCHAR(150) NOT NULL,
  budget_range VARCHAR(50) NOT NULL,
  project_deadline DATE,
  additional_notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Files uploaded as inspiration for a project brief
CREATE TABLE IF NOT EXISTS brief_attachments (
  id SERIAL PRIMARY KEY,
  brief_id INTEGER NOT NULL REFERENCES project_briefs(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspiration gallery items
CREATE TABLE IF NOT EXISTS inspiration_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Newsletter / "Start Project" quick interest signups
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_briefs_status ON project_briefs(status);
CREATE INDEX IF NOT EXISTS idx_inspiration_category ON inspiration_items(category);
