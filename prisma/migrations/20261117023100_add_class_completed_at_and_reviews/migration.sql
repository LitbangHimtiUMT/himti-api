-- AlterTable: nullable completed_at on classes (null = not completed).
-- Existing rows are untouched: a completed class is only ever marked
-- through the complete endpoint, never by backfill.
ALTER TABLE "classes" ADD COLUMN "completed_at" TIMESTAMP(0);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "class_id" VARCHAR(110) NOT NULL,
    "user_id" VARCHAR(110) NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: one review per (user, class).
CREATE UNIQUE INDEX "reviews_user_class_unique" ON "reviews"("user_id", "class_id");
CREATE INDEX "reviews_fk_1" ON "reviews"("class_id");
CREATE INDEX "reviews_fk_2" ON "reviews"("user_id");

-- AddForeignKey: deleting a class or a user deletes its reviews.
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
