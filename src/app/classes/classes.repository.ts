import { prisma } from "../../config";
import { type CreateClassBodyRequest } from "./classes.dto";

export const createClass = async ({
  name,
  description,
  createdBy,
  price,
  thumbnail,
}: CreateClassBodyRequest) => {
  return await prisma.class.create({
    data: {
      name,
      description,
      price,
      createdBy,
      thumbnail,
    },
    select: {
      id: true,
    },
  });
};
