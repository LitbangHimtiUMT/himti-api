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
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      participant: true,
      mentor: true,
    },
  });
};

export const getSubmissionByAssignmentRepository = async (
  assignmentId: string,
  status?: SubmissionStatus[]
) => {
  return prisma.submission.findMany({
    where: {
      assignmentId,
      ...(status && {
        status: {
          in: status,
        },
      }),
    },
    include: {
      assignment: true,
      participant: true
    }
  });
};

export const updateStatusSubmission = async (submissionId: string, status: SubmissionStatus, actionBy: string, feedback?: string) => {
  return await prisma.submission.update({
    where: {
      id: submissionId,
    },
    data: {
      status,
      actionBy,
      feedback
    },
  });
};