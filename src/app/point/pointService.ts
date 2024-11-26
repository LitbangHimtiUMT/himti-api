import { getUserPoint } from "../user/userRepository";
import { UserData, getUserPointsDTOMapper } from "./pointMapper";

export const getUserPointsService = async () => {
  const users = await getUserPoint();
  const data = getUserPointsDTOMapper(users as unknown as UserData[]);
  return data;
};
