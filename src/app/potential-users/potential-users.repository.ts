import { prisma } from "../../config";
import {
  CreatePotentialUserDTO,
  UpdatePotentialUserDTO,
} from "./potential-users.dto";

export const findAllPotentialUsers = async () => {
  return await prisma.potentialUsers.findMany({
    
  });
};

export const createPotentialUser = async (data: CreatePotentialUserDTO) => {
  return await prisma.potentialUsers.create({
    data,
  });
};

export const updatePotentialUser = async (
  id: string,
  data: UpdatePotentialUserDTO
) => {
  return await prisma.potentialUsers.update({
    where: { id },
    data,
  });
};
