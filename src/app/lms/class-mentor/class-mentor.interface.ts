import { ClassMentor, User } from "@prisma/client";

export interface ClassMentorData extends ClassMentor {
  // Narrowed on purpose: the repository selects only these user
  // fields (never the password hash) for mentor listings.
  user: Pick<User, "id" | "name" | "email" | "photo">;
}
