import { Mentor, User } from "@prisma/client";
import { MentorDTO } from "./mentor.dto";

export interface MentorData extends Mentor {
  user: User | null;
}

export const getMentorsDTOMapper = (data: MentorData[]): MentorDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item?.user?.name ?? "",
    email: item?.user?.email ?? "",
    balance: Number(item?.balance),
  }));
};
