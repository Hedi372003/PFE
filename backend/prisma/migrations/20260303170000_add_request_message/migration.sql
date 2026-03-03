ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "message" TEXT;

UPDATE "requests"
SET "message" = COALESCE(NULLIF(TRIM("robot_id"), ''), 'No message provided')
WHERE "message" IS NULL;

ALTER TABLE "requests" ALTER COLUMN "message" SET NOT NULL;
