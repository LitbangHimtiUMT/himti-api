import { MentorTransactionType } from "@prisma/client";
import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";

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
    include: {
      withDraw: true,
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
