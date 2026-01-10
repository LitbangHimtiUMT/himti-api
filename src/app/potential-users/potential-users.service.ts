import {
  createPotentialUser,
  findAllPotentialUsers,
  updatePotentialUser,
} from "./potential-users.repository";
import {
  CreatePotentialUserDTO,
  UpdatePotentialUserDTO,
} from "./potential-users.dto";
import { ImagePath } from "../../utils/image-path";
import { BUCKET_FOLDER } from "../../utils/upload-file-to-storage";

export const getAllPotentialUsersService = async () => {
  const users = await findAllPotentialUsers();
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    nim: user.nim,
    photo: user.photo
      ? ImagePath(`${BUCKET_FOLDER.user}/${user.photo}`)
      : null,
    experience: user.potentialUsers,
  }));
};

export const createPotentialUserService = async (
  data: CreatePotentialUserDTO
) => {
  return await createPotentialUser(data);
};

export const updatePotentialUserService = async (
  id: string,
  data: UpdatePotentialUserDTO
) => {
  return await updatePotentialUser(id, data);
};
