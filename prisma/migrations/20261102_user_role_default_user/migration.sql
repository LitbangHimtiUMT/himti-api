-- AlterTable: change the default role for newly created users
-- from ADMIN to USER. Existing rows are NOT changed: this only
-- affects rows created without an explicit role from now on.
-- The public register flow already passes an explicit role, and
-- createUserService now defaults to USER, so this is a defence-in-
-- depth change against any code path that omits the role.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
