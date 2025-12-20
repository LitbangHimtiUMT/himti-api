import {
  createPotentialUser,
  findAllPotentialUsers,
  updatePotentialUser,
} from "./potential-users.repository";
import {
  CreatePotentialUserDTO,
  UpdatePotentialUserDTO,
} from "./potential-users.dto";

export const getAllPotentialUsersService = async () => {
  return await findAllPotentialUsers();
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
