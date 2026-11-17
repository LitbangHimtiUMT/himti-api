-- CreateEnum: role printed on the certificate. Every certificate
-- issued before this migration is a participant claim, so the
-- column default below backfills them as PESERTA.
CREATE TYPE "CertificateRole" AS ENUM ('PESERTA', 'PEMATERI');

-- AlterTable: Structural gains a department discriminator (the
-- KETUA_DEPARTMENT rows were indistinguishable) and an optional
-- signature image filename, stored like `image` (filename only;
-- the API builds the public URL).
ALTER TABLE "structural" ADD COLUMN "department" VARCHAR(50);
ALTER TABLE "structural" ADD COLUMN "signature_image" VARCHAR(255);

-- AlterTable: ProdiStructural gains an optional signature image
-- filename, stored like `image`.
ALTER TABLE "prodi_structural" ADD COLUMN "signature_image" VARCHAR(255);

-- AlterTable: Certificate gains its printed role, the formal
-- number, and a JSON snapshot of the three signers taken at claim
-- time (leadership rotation must not rewrite issued certificates).
-- Old rows keep NULL formalNumber/signers: the /file endpoint
-- renders them from live signer data without a formal number row.
ALTER TABLE "certificates" ADD COLUMN "role" "CertificateRole" NOT NULL DEFAULT 'PESERTA';
ALTER TABLE "certificates" ADD COLUMN "formal_number" VARCHAR(100);
ALTER TABLE "certificates" ADD COLUMN "signers" JSONB;

-- CreateTable: a single global counter row (id = 1). The formal
-- number sequence never resets; it keeps counting across years.
CREATE TABLE "certificate_counters" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "last_number" INTEGER NOT NULL,

    CONSTRAINT "certificate_counters_pkey" PRIMARY KEY ("id")
);

-- Seed: the last known formal number is 030, so the first claim
-- after this migration takes 031.
INSERT INTO "certificate_counters" ("id", "last_number") VALUES (1, 30);
