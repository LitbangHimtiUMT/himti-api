import { getUserPoint } from "../user/user.repository";
import { UserData, getUserPointsDTOMapper } from "./point.mapper";

export const getUserPointsService = async () => {
  const users = await getUserPoint();
  const data = getUserPointsDTOMapper(users as unknown as UserData[]);
  return data;
};
