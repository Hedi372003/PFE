-- Ensure UUID generation function is available for new user IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add new columns with temporary defaults/backfill-safe constraints
ALTER TABLE "users"
ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "robot_id" TEXT,
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Backfill from legacy columns
UPDATE "users"
SET
  "first_name" = COALESCE(NULLIF(split_part("name", ' ', 1), ''), 'User'),
  "last_name" = COALESCE(NULLIF(trim(substring("name" FROM position(' ' IN "name") + 1)), ''), 'Unknown'),
  "phone" = COALESCE(NULLIF("phone", ''), '+0000000000'),
  "robot_id" = "robot_assigned_id";

-- Make required columns NOT NULL after backfill
ALTER TABLE "users"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- Update id default strategy and role default
ALTER TABLE "users"
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "role" SET DEFAULT 'user';

-- Remove legacy columns no longer used
ALTER TABLE "users"
DROP COLUMN "name",
DROP COLUMN "robot_assigned_id";
