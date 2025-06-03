import { prisma } from "../../../config";
import { CreateAssignmentDTO } from "./assignment.dto";

export const createAssignmentRepository = async (data: CreateAssignmentDTO) => {
  return await prisma.assignment.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      moduleId: data.moduleId,
      isFinalAssigment: data.isFinalAssignment || false,
      allowedFile: data.allowedFile,
      type: data.type,
    },
  });
};

export const getAssignmentDetailRepository = async (
  id: string,
  userId?: string
) => {
  return await prisma.assignment.findUnique({
    where: {
      id,
    },
    include: {
      module: {
        include: {
          session: {
            include: {
              class: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      submission: {
        where: {
          ...(userId && {
            userId,
          }),
        },
      },
    },
  });
};

export const getAssignmentByIdRepository = async (id: string) => {
  return prisma.assignment.findUnique({
    where: {
      id,
    },
  });
}