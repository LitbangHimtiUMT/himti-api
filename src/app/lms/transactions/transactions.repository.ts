import { prisma } from "../../../config";
import { CreateTransactionDTO } from "./transactions.dto";

export const createTransactionRepository = async (
  data: CreateTransactionDTO
) => {
  return await prisma.transaction.create({
    data: {
      amount: data.amount,
      uniqueCode: data.uniqueCode,
      classId: data.classId,
      userId: data.userId,
      paymentMethod: data.paymentMethod,
      status: "PENDING",
    },
  });
};
