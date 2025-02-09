import { Mentor, MentorTransactionHistory, User } from "@prisma/client";
import { MentorDTO } from "./mentor.dto";
import { ImagePath } from "../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";

export interface MentorData extends Mentor {
  user: User | null;
}

export const getMentorsDTOMapper = (data: MentorData[]): MentorDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item?.user?.name ?? "",
    email: item?.user?.email ?? "",
    balance: Number(item?.balance),
    photo: item?.user?.photo
      ? ImagePath(`${BUCKET_FOLDER.user}/${item?.user?.photo}`)
      : null,
    facebook: item?.facebook ?? null,
    instagram: item?.instagram ?? null,
    linkedin: item?.linkedin ?? null,
    twitter: item?.twitter ?? null,
  }));
};

export const getDetailMentorDTOMapper = (
  data: MentorData,
  mentorTransaction: MentorTransactionHistory[]
) => {
  return {
    id: data.id,
    name: data?.user?.name ?? "",
    email: data?.user?.email ?? "",
    balance: Number(data?.balance),
    totalExpend: mentorTransaction
      .filter((item) => item.type === "EXPEND")
      .reduce((a, b) => Number(a) + Number(b.amount), 0),
    totalIncome: mentorTransaction
      .filter((item) => item.type === "EXPEND")
      .reduce((a, b) => Number(a) + Number(b.amount), 0),
  };
};
