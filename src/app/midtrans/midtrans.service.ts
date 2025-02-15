import axios, { AxiosResponse } from "axios";
import { CreateMidtransTransactionDTO, MidtransResponse } from "./midtrans.dto";
import { environment } from "../../libs";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";

export const createMidtransTransaction = async (
  data: CreateMidtransTransactionDTO
) => {
  try {
    const authString = Buffer.from(
      environment.MIDTRANS.SERVER_KEY + ":"
    ).toString("base64");
    console.log("auth string: ", authString);
    const url = `${environment.MIDTRANS.SNAP_URL}/snap/v1/transactions`;
    const res = await axios.post(url, data, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });
    return res as AxiosResponse<MidtransResponse>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "Error in create transaction:",
      error.response ? error.response.data : error?.message
    );
    return new ErrorApp(
      `Failed to process create transaction: ${error.response ? JSON.stringify(error.response.data, null, 2) : error?.message}`,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
};
