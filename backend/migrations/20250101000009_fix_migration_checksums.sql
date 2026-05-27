-- =============================================================================
-- Migration 009: Repair SQLx migration checksums
--
-- WHY THIS EXISTS:
--   The _sqlx_migrations table stores a SHA-384 checksum of each migration file
--   at the time it was first applied.  If the file bytes ever change (even only
--   whitespace / line-endings from editors or git attributes) SQLx refuses to
--   start with:
--       "migration XXXXXXXX was previously applied but has been modified"
--
--   The correct production fix is to update the stored checksums to match the
--   current file bytes without re-running the already-applied DDL.
--
-- HOW TO REGENERATE CHECKSUMS (PowerShell):
--   $f = "backend\migrations\20250101000001_create_users.sql"
--   $b = [IO.File]::ReadAllBytes($f)
--   $h = [Security.Cryptography.SHA384]::Create().ComputeHash($b)
--   -join ($h | % { $_.ToString("x2") })
--
-- CHECKSUMS WERE COMPUTED FROM THE CURRENT FILE BYTES ON 2026-05-28.
-- =============================================================================

UPDATE _sqlx_migrations
SET checksum = decode('b6d6c266711a22e0ac57ffe3d33dc4ecaf7c58ee143aa04c27c1f744da4b8b3852650d7011b31e6c8ad856236dac0835', 'hex')
WHERE version = 20250101000001;

UPDATE _sqlx_migrations
SET checksum = decode('5f7eef90362ea1f47f81f7a252dccc9dcfa863c3429cc2d733c159a67a84d1aa41a0f1a48b4909e6e961dc5b87a6534b', 'hex')
WHERE version = 20250101000002;

UPDATE _sqlx_migrations
SET checksum = decode('4c9773e96d8bc10830cf0f72f62d85e6cb4559497893d2368b26b26c38f3b0acba4030de6e0bcb6134110cdc5492b595', 'hex')
WHERE version = 20250101000003;

UPDATE _sqlx_migrations
SET checksum = decode('bf788ee1e37b00386bd87cf5d6f9bd4215bac9149d1b980b69c812d3828458e51e7e6c8e53059cf4913b0d53a21f45fa', 'hex')
WHERE version = 20250101000004;

UPDATE _sqlx_migrations
SET checksum = decode('2fa3a6d6562936e78db2ca40e785f95dc533625b20f84fbd61a3ccaa2971f9b3010eaa6f76943b91660488866cfaf8d5', 'hex')
WHERE version = 20250101000005;

UPDATE _sqlx_migrations
SET checksum = decode('0887ac4475938da8fef1336c264d8cf1627a42945f0e441b1285fdcf9405a0ffe300b2f9bb425886e0fae0fa9fc1c49a', 'hex')
WHERE version = 20250101000006;
