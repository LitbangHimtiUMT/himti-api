import { SubmissionStatus } from "@prisma/client";
import { prisma } from "../../../../config";
import { SubmissionCreationDTO } from "../assignment.dto";

export const createSubmissionRepository = async (
  data: SubmissionCreationDTO
) => {
  return await prisma.submission.create({
    data: {
      assignmentId: data.assignmentId,
      userId: data.submittedBy,
      status: SubmissionStatus.REVIEWED,
      file: data.file,
    },
  });
};
