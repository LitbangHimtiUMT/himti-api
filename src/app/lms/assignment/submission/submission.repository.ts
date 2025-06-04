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
      status: SubmissionStatus.REVIEW,
      file: data.file,
    },
  });
};

export const getSubmissionByIdRepository = async (id: string) => {
  return await prisma.submission.findUnique({
    where: {
      id,
    },
    include: {
      assignment: {
        include: {
          module: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      mentor: true,
    }
  });
};