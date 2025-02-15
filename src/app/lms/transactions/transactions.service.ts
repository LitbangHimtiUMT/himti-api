import { TransactionStatus } from "@prisma/client";
import { MidtransCallbackTransactionDTO } from "../../midtrans/midtrans.dto";
import {
  getTransactionByUniqueCode,
  updateTransactionWithCreateClassParticipant,
} from "./transactions.repository";

export const updateStatusAfterTransaction = async (
  status: TransactionStatus,
  data: MidtransCallbackTransactionDTO
) => {
  const transaction = await getTransactionByUniqueCode(
    data.order_id as unknown as string
  );

  if (!transaction) {
    return;
  }
  console.log("Updating transaction status:", status, data);
  const res = await updateTransactionWithCreateClassParticipant(
    transaction?.id,
    status as TransactionStatus,
    data.payment_type ?? "",
    data.settlement_time ?? "",
    data.signature_key ?? ""
  );
  console.log("Transaction updated:", res);
  return res;
};

export const callbackClassTransaction = async (
  data: MidtransCallbackTransactionDTO
) => {
  let status: TransactionStatus | null = null;

  if (data.transaction_status === "capture") {
    if (data.fraud_status === "accept") {
      status = TransactionStatus.SUCCESS;
    }
  } else if (data.transaction_status === "settlement") {
    status = TransactionStatus.SUCCESS;
  } else if (
    data.transaction_status === "cancel" ||
    data.transaction_status === "deny" ||
    data.transaction_status === "expire"
  ) {
    status = TransactionStatus.FAILED;
  } else if (data.transaction_status === "pending") {
    status = TransactionStatus.PENDING;
  }
  console.log(`Transaction ${data.order_id} status: ${status}`);
  if (status) {
    await updateStatusAfterTransaction(status, data);
    return true;
  }
  return false;
};
