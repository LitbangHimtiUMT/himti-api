-- DropTable: TicketSuport was never mounted in production main
-- (its route files were orphaned and removed in Fase 3), so this
-- table has no live API writer. Dropping it is destructive for any
-- rows that may exist from older builds: run this only after a
-- production backup, and only before deploying the code that
-- removes the model (otherwise Prisma and the DB disagree).
DROP TABLE "ticket_suport";
