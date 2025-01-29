import { MentorTransactionType } from "@prisma/client";
import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../achievements/achievements.repository";

export const getMentorTransactionsByMentorIdRepository = async (
  mentorId: string,
  query?: Query
) => {
  const { transactionType } = query ?? {};
  return await prisma.mentorTransactionHistory.findMany({
    where: {
      mentorId,
      ...(transactionType && {
        type: transactionType as MentorTransactionType,
      }),
    },
    ...(query && queryPagination(query)),
  });
};

export const getMentorTransactionsByMentorIdCountRepository = async (
  mentorId: string,
  query?: Query
) => {
  const { transactionType } = query ?? {};
  return await prisma.mentorTransactionHistory.count({
    where: {
      mentorId,
      ...(transactionType && {
        type: transactionType as MentorTransactionType,
      }),
    },
  });
};
