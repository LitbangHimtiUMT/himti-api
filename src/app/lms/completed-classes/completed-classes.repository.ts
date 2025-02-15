import { prisma } from "../../../config";
import { type CreateCompletedClassBodyRequest } from "./completed-classes.dto";

export const getCompletedClassById = async (classId: string) => {
  return await prisma.completedClass.findUnique({
    where: {
      id: classId,
    },
    select: {
      id: true,
      userId: true,
      classId: true,
    },
  });
};

export const createCompletedClassRepository = async (
  data: CreateCompletedClassBodyRequest,
  userId: string,
) => {
  const { classId } = data;

  return await prisma.completedClass.create({
    data: {
      userId: userId as string,
      classId: classId as string,
    },
  });
};
