import { ClassMentor, User } from "@prisma/client";

export interface ClassMentorData extends ClassMentor {
  user: User;
}
