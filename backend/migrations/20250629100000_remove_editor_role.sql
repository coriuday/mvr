-- Migrate legacy Editor staff accounts to Counselor before removing the role from application code.
UPDATE users SET role = 'COUNSELOR' WHERE role = 'EDITOR';
