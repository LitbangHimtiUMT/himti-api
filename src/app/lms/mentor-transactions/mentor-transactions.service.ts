import { Query } from "../../../interface/Query";
import { Meta } from "../../../utils/meta";
import { getMentorTransactionsByMentorDTOMapper } from "./mentor-transactions.mapper";
import {
  getMentorTransactionsByMentorIdCountRepository,
  getMentorTransactionsByMentorIdRepository,
} from "./mentor-transactions.repository";

export const getMentorTransactionsByMentorService = async (
  mentorId: string,
  query: Query
) => {
  const { page = "1", perPage = "10" } = query;
  const [transactions, totalData] = await Promise.all([
    getMentorTransactionsByMentorIdRepository(mentorId, query),
    getMentorTransactionsByMentorIdCountRepository(mentorId, query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    meta,
    data: getMentorTransactionsByMentorDTOMapper(transactions),
  };
};
