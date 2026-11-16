-- AlterEnum: add ARCHIVED to ClassStatus. Kept alone in this migration
-- so the new value is never used in the same transaction that adds it.
ALTER TYPE "ClassStatus" ADD VALUE 'ARCHIVED';
