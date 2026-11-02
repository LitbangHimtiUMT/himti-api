-- CreateTable: SubAcara as a child of Event (PROVISIONAL, Fase 2).
-- Must run on production BEFORE deploying the code that uses it:
-- without this table, sub-acara inserts fail.
CREATE TABLE "sub_acara" (
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

CREATE INDEX "sub_acara_fk_1" ON "sub_acara"("event_id");

ALTER TABLE "sub_acara" ADD CONSTRAINT "sub_acara_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
