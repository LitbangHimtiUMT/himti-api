import { SubmissionStatus } from "@prisma/client";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getModuleById } from "../modules/modules.repository";
import { CreateAssignmentDTO } from "./assignment.dto";
import {
  createAssignmentRepository,
  getAssignmentByIdRepository,
} from "./assignment.repository";

export const createAssignmentService = async (
  moduleId: string,
  data: Omit<CreateAssignmentDTO, "moduleId">,
  userId: string
) => {
  const modules = await getModuleById(moduleId);
  if (!modules) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (userId !== modules.session.class.createdBy) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  if (new Date() > new Date(data.dueDate)) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.DUE_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await createAssignmentRepository({
    dueDate: data.dueDate,
    title: data.title,
    description: data.description,
    moduleId,
    isFinalAssignment: data.isFinalAssignment,
    type: data.type,
    allowedFile: data.allowedFile,
  });
};

export const getAssignmentByIdService = async (
  assignmentId: string,
  userId: string
) => {
  const assignment = await getAssignmentByIdRepository(assignmentId, userId);
  if (!assignment) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
    const activeSubmission = assignment
      ? assignment.submission.find(
          (item) => item.status === SubmissionStatus.REVIEWED
        ) || null
      : null;
  return {
    ...assignment,
    activeSubmission,
  };
};
