import { MentorTransactionHistory, WithDrawApproval } from "@prisma/client";
import { ImagePath } from "../../../utils/image-path";

export interface MentorTransactionData extends MentorTransactionHistory {
  withDraw: WithDrawApproval | null;
}

export const getMentorTransactionsByMentorDTOMapper = (
  data: MentorTransactionData[]
) => {
  return data.map((item) => ({
    id: item.id,
    type: item.type,
    amount: Number(item.amount),
    createdAt: item.createdAt,
    withDraw: item.withDraw
      ? {
          id: item.withDraw.id,
          status: item.withDraw.status,
          notes: item.withDraw.notes ?? null,
          accountNumber: item.withDraw.accountNumber ?? null,
          paymentMethod: item.withDraw.paymentMethod ?? null,
          evidence: item.withDraw?.evidence
            ? ImagePath(`mentor-transactions/${item.withDraw.evidence}`)
            : null,
          createdAt: item.withDraw.createdAt,
        }
      : null,
  }));
};
