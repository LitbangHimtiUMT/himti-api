import { prisma } from "../../config";
import {
  CreatePotentialUserDTO,
  UpdatePotentialUserDTO,
} from "./potential-users.dto";

export const findAllPotentialUsers = async () => {
  return await prisma.user.findMany({
    where: {
      potentialUsers: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      nim: true,
      photo: true,
      potentialUsers: {
        select: {
          id: true,
          role: true,
          company: true,
          experienceYear: true,
          isActive: true,
          summary: true,
          skills: true,
          projects: true,
          education: true,
          portfolioUrl: true,
          resumeUrl: true,
        },
      },
    },
  });
};

export const createPotentialUser = async (data: any) => {
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
