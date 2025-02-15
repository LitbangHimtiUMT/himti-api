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
