import { SubmissionStatus } from "@prisma/client";
import { MESSAGE_CODE } from "../../../../utils/error-code";
import { ErrorApp } from "../../../../utils/http-error";
import { MESSAGES } from "../../../../utils/messages";
import {
  getSubmissionMapper,
  getSubmissionsMapper,
  SubmissionData,
} from "./submission.mapper";
import {
  getSubmissionByAssignmentRepository,
  getSubmissionByIdRepository,
  updateStatusSubmission
} from "./submission.repository";

export const getSubmissionByIdService = async (id: string) => {
  const submission = await getSubmissionByIdRepository(id);
  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  submission.assignment.module;
  return getSubmissionMapper(submission as unknown as SubmissionData);
};

export const getSubmissionByAssignmentService = async (
  assignmentId: string
) => {
  const submission = await getSubmissionByAssignmentRepository(assignmentId, [
    SubmissionStatus.APPROVE,
    SubmissionStatus.REVIEW,
    SubmissionStatus.REVIEW,
  ]);

  return getSubmissionsMapper(submission as unknown as SubmissionData[]);
};

export const rejectSubmissionService = async(submissionId: string, userId: string) => {
  const submission = await getSubmissionByIdRepository(submissionId)

  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if(submission.status !== 'REVIEW') {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.REVIEW_STATUS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    )
  }
  if(submission?.assignment.module?.session.class.createdBy !== userId) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.REJECT_SUBMISSION,
      403,
      MESSAGE_CODE.FORBIDDEN
    )
  }

  return await updateStatusSubmission(submissionId, SubmissionStatus.REJECT, userId)
}

export const approveSubmissionService = async(submissionId: string, userId: string) => {
  const submission = await getSubmissionByIdRepository(submissionId)

  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if(submission.status !== 'REVIEW') {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.REVIEW_STATUS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    )
  }
  if(submission?.assignment.module?.session.class.createdBy !== userId) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.REJECT_SUBMISSION,
      403,
      MESSAGE_CODE.FORBIDDEN
    )
  }

  return await updateStatusSubmission(submissionId, SubmissionStatus.APPROVE, userId)
}