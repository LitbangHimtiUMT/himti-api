-- CreateTable: SubAcara as a child of Event (PROVISIONAL, Fase 2).
-- Must run on production BEFORE deploying the code that uses it:
-- without this table, sub-acara inserts fail.
--
-- Guarded like the role migration: the repo's migration history is
-- incomplete, so if the parent "event" table is absent this logs a
-- NOTICE and skips the foreign key instead of failing. Verify the
-- table list in the target database before deploying.
CREATE TABLE IF NOT EXISTS "sub_acara" (
    "id" VARCHAR(110) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(255),
    "start_time" TIMESTAMP(0) NOT NULL,
    "end_time" TIMESTAMP(0) NOT NULL,
    "is_open_absen" BOOLEAN NOT NULL DEFAULT false,
    "event_id" VARCHAR(110) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "sub_acara_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sub_acara_fk_1" ON "sub_acara"("event_id");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'event'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sub_acara_event_id_fkey'
  ) THEN
    ALTER TABLE "sub_acara" ADD CONSTRAINT "sub_acara_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  ELSE
    RAISE NOTICE 'SKIPPED sub_acara FK: parent "event" table missing or constraint already exists, verify the target database';
  END IF;
END $$;
