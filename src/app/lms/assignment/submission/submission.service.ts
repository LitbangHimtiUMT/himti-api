import { HistoryModule, SubmissionStatus } from "@prisma/client";
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
  updateStatusSubmission,
} from "./submission.repository";
import { getMentorByClassRepository } from "../../class-mentor/class-mentor.repository";
import {
  historyApproveFlag,
  historyRejectFlag,
} from "../../../history/history.repository";

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
    SubmissionStatus.REJECT,
  ]);

  return getSubmissionsMapper(submission as unknown as SubmissionData[]);
};

export const rejectSubmissionService = async (
  submissionId: string,
  userId: string,
  feedback?: string
) => {
  const submission = await getSubmissionByIdRepository(submissionId);

  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (submission.status !== "REVIEW") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.REVIEW_STATUS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const classId = submission.assignment?.module?.session.class.id;
  if (classId) {
    const mentors = await getMentorByClassRepository(classId, {});
    const isJoin = mentors.find((item) => item.userId === userId);
    if (
      userId !== submission?.assignment?.module?.session.class.createdBy &&
      !isJoin
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
        403,
        MESSAGE_CODE.FORBIDDEN
      );
    }
  }

  const result = await updateStatusSubmission(
    submissionId,
    SubmissionStatus.REJECT,
    userId,
    feedback
  );

  await historyRejectFlag({
    module: HistoryModule.CLASS,
    title: `Submission ${submission.participant.name} of ${submission.assignment.title} is reject${feedback ? ` with feedback: ${feedback}` : ""}`,
    actionId: classId,
    createdBy: userId,
  });
  return result;
};

export const approveSubmissionService = async (
  submissionId: string,
  userId: string
) => {
  const submission = await getSubmissionByIdRepository(submissionId);

  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (submission.status !== "REVIEW") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.REVIEW_STATUS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const classId = submission.assignment?.module?.session.class.id;
  if (classId) {
    const mentors = await getMentorByClassRepository(classId, {});
    const isJoin = mentors.find((item) => item.userId === userId);
    if (
      userId !== submission?.assignment?.module?.session.class.createdBy &&
      !isJoin
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
        403,
        MESSAGE_CODE.FORBIDDEN
      );
    }
  }

  const result = await updateStatusSubmission(
    submissionId,
    SubmissionStatus.APPROVE,
    userId
  );
  await historyApproveFlag({
    module: HistoryModule.CLASS,
    title: `Submission ${submission.participant.name} of ${submission.assignment.title} is approve`,
    actionId: classId,
    createdBy: userId,
  });
  return result;
};
