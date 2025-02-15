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
    },
  });
};
