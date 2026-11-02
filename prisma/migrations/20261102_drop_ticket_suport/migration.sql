-- DropTable: TicketSuport was never mounted in production main
-- (its route files were orphaned and removed in Fase 3), so this
-- table has no live API writer.
--
-- Guarded with IF EXISTS: the initial migration in this repo never
-- created this table (it was added later without a migration), so
-- on a database where it was never created this is a no-op instead
-- of an error. If the table does exist, dropping it is destructive
-- for any rows from older builds: run only after a production backup.
DROP TABLE IF EXISTS "ticket_suport";
