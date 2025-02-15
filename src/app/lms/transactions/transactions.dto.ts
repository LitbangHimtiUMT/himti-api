export interface CreateTransactionDTO {
  amount: number;
  uniqueCode: string;
  classId: string;
  userId: string;
  paymentMethod?: string;
}

