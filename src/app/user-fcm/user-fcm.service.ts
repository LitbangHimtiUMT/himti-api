import { Query } from "../../interface/Query";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { userFCMDTOMapper } from "./user-fcm.mapper";
import {
  deleteUserFCM,
  getAllFCMUser,
  getAllFCMUserCount,
  getFCMUserById,
} from "./user-fcm.repository";

export const getAllFCMUserService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [fcmUser, totalData] = await Promise.all([
    getAllFCMUser(query),
    getAllFCMUserCount(query),
  ]);

  const data = userFCMDTOMapper(fcmUser);
  const meta = Meta(Number(page), Number(perPage), totalData);
  return { data, meta };
};

export const deleteUserFCMUserService = async (userFcmId: string) => {
  const userFCM = await getFCMUserById(userFcmId);

  if (!userFCM) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.FCM,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const result = await deleteUserFCM(userFCM.id);
  return result;
};
