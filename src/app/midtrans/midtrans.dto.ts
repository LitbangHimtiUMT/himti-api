export interface CreateMidtransTransactionDTO {
  transaction_id?: string;
  transaction_details?: {
    order_id?: string;
    gross_amount?: number;
  };
  customer_details?: {
    name?: string;
    email?: string;
  };
  item_details?: ItemDetail[];
  callbacks?: {
    finish: string;
    error: string;
    pending: string;
  };
}

export interface ItemDetail {
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransResponse {
  token?: string;
  redirect_url: string;
}

interface VaNumber {
  va_number: string;
  bank: string;
}

export interface MidtransCallbackTransactionDTO {
  va_numbers?: VaNumber[];
  transaction_type?: string;
  transaction_time?: string;
  transaction_status?: string;
  transaction_id?: string;
  status_message?: string;
  status_code?: string;
  signature_key?: string;
  settlement_time?: string;
  reference_id?: string;
  payment_type?: string;
  order_id?: string;
  merchant_id?: string;
  issuer?: string;
  gross_amount?: string;
  fraud_status?: string;
  expiry_time?: string;
  currency?: string;
  acquirer?: string;
}
