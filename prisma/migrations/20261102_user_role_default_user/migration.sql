-- AlterTable: change the default role for newly created users
-- from ADMIN to USER. Existing rows are NOT changed: this only
-- affects rows created without an explicit role from now on.
--
-- WARNING: the repo's migration history is incomplete (only the
-- initial migration exists; later models were added without
-- migrations), so the real production tables cannot be proven from
-- this folder alone. This migration is therefore guarded: if the
-- table is absent it logs a NOTICE and does nothing, instead of
-- failing the whole deploy. A NOTICE here means the database you
-- ran this on is NOT the database the API runs against (or its
-- schema differs) — stop and verify the table list before deploying.
-- Do NOT treat a guarded success as proof the default changed.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'user'
  ) THEN
    ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';
  ELSE
    RAISE NOTICE 'SKIPPED: table "user" not found in schema %, verify the target database before deploying', current_schema();
  END IF;
END $$;
