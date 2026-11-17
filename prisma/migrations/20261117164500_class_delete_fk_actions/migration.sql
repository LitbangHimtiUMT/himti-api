-- ClassMentor rows are only links between a class and its mentors, so they
-- must go away with the class. Meeting rows belong to their event meeting
-- and only reference a class optionally, so deleting a class unlinks them
-- instead of deleting the meeting.
ALTER TABLE "class_mentor" DROP CONSTRAINT "class_mentor_class";
ALTER TABLE "class_mentor" ADD CONSTRAINT "class_mentor_class" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meeting" DROP CONSTRAINT "meeting_class_id_fkey";
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
