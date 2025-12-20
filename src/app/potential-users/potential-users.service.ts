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
  const users = await findAllPotentialUsers();
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    nim: user.nim,
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
