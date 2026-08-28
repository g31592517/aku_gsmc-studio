-- ─── DEMO USER RESET ──────────────────────────────────────────────────────────
-- Wipes all existing users (and their service requests / submissions / attachments
-- / status history / internal notes, all of which cascade from service_requests)
-- and replaces them with exactly two named demo accounts:
--
--   allan.rono@aku.edu      (client) — submits creative service requests
--   onyango.geoffrey@aku.edu (staff) — receives and works on those requests
--
-- This is a destructive, dev/demo-only reset. It is intentionally kept separate
-- from schema.sql (which only ever creates/adds structural data) so that running
-- schema.sql to apply a future migration can never accidentally wipe real users.
-- Run it explicitly, only when you want to reset demo data back to this state:
--
--   sqlcmd -S "localhost,1433" -E -C -d aku_creative -i resetDemoUsers.sql
--
-- Password for both accounts: 12345678 (same seed hash already used for the
-- retired staff1/staff2 demo accounts in schema.sql).
-- Hash precomputed via: node -e "console.log(require('bcryptjs').hashSync('12345678', 10))"

USE aku_creative;
GO

-- Detach inspiration/asset audit columns from users about to be removed.
-- (Not surfaced anywhere in the UI — safe to clear on a demo reset.)
UPDATE inspiration_assets SET created_by = NULL, updated_by = NULL;
GO

-- service_requests cascade-deletes request_attachments, request_status_history,
-- request_internal_notes, request_submissions (which in turn cascade-deletes
-- request_submission_files) — see schema.sql for the FK definitions.
DELETE FROM service_requests;
GO

DELETE FROM notifications;
GO

DELETE FROM users;
GO

INSERT INTO users (email, contact_number, role_id, password_hash)
VALUES (
  'allan.rono@aku.edu',
  '+000000000000',
  (SELECT id FROM user_roles WHERE name = 'client'),
  '$2b$10$/WKMCj987eXtLZMl3/iO1el/uoInHerdxxkwtlV2gC0xXLNrWr6iK'
);

INSERT INTO users (email, contact_number, role_id, password_hash)
VALUES (
  'onyango.geoffrey@aku.edu',
  '+000000000000',
  (SELECT id FROM user_roles WHERE name = 'staff'),
  '$2b$10$/WKMCj987eXtLZMl3/iO1el/uoInHerdxxkwtlV2gC0xXLNrWr6iK'
);
GO
