import { TransactionStatus } from "@prisma/client";
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

export const getTransactionByUniqueCode = async (uniqueCode: string) => {
  return await prisma.transaction.findUnique({
    where: {
      uniqueCode,
    },
  });
};

export const updateTransactionWithCreateClassParticipant = async (
  transactionId: string,
  status: TransactionStatus,
  paymentMethod: string,
  settlementTime: string,
  signatureKey: string
) => {
  return await prisma.$transaction(async (tx) => {
    const trx = await tx.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status,
        paymentMethod,
        paymentTime: new Date(settlementTime),
        signatureKey,
      },
    });

    const existing = await tx.classParticipant.findFirst({
      where: {
        classId: trx.classId,
        userId: trx.userId,
      },
    });

    if (!existing) {
      await tx.classParticipant.create({
        data: {
          classId: trx.classId,
          userId: trx.userId,
        },
      });
    }

    return trx;
  });
};
