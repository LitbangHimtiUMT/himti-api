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
import {
  canManageClass,
  classIdFromAssignment,
  classIdFromSubmission,
  requireClassAccess,
  requireClassManage,
} from "../../../../utils/lms-access";
import {
  historyApproveFlag,
  historyRejectFlag,
} from "../../../history/history.repository";
import { getUserById } from "../../../authentication/auth.repository";
import { rejectEmail } from "./submission.utility";

export const getSubmissionByIdService = async (id: string, userId?: string) => {
  const submission = await getSubmissionByIdRepository(id);
  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (userId) {
    // Owner may read their own submission; managers may read any
    // submission of their class. A participant who is not a manager
    // and not the owner gets 403 (requireClassAccess alone would
    // let any participant of the class read anyone's submission).
    const classId = await classIdFromSubmission(id);
    const denied = await requireClassAccess(userId, classId ?? "");
    if (denied) return denied;
    const isManager = await canManageClass(userId, classId ?? "");
    if (!isManager && submission.userId !== userId) {
      return new ErrorApp(
        MESSAGES.ERROR.FORBIDDEN.ROLE,
        403,
        MESSAGE_CODE.FORBIDDEN
      );
    }
  }
  submission.assignment.module;
  return getSubmissionMapper(submission as unknown as SubmissionData);
};

export const getSubmissionByAssignmentService = async (
  assignmentId: string,
  userId?: string
) => {
  if (userId) {
    const classId = await classIdFromAssignment(assignmentId);
    const denied = await requireClassManage(userId, classId ?? "");
    if (denied) return denied;
  }
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
  const denied = await requireClassManage(
    userId,
    submission.assignment?.module?.session.class.id ?? ""
  );
  if (denied) return denied;
  const classId = submission.assignment?.module?.session.class.id;

  const mentor = await getUserById(userId);

  if (!mentor) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const result = await updateStatusSubmission(
    submissionId,
    SubmissionStatus.REJECT,
    userId,
    feedback
  );

  if (submission?.assignment?.module?.session?.class) {
    await rejectEmail(submission.participant.email, {
      assignmentName: submission.assignment.title,
      className: submission?.assignment?.module?.session.class.name,
      instructorName: mentor.name,
      participant: {
        email: submission.participant.email,
        name: submission.participant.name,
      },
      submittedAt: submission.createdAt,
      feedback: result?.feedback ?? undefined,
    });
  }
  await historyRejectFlag({
    module: HistoryModule.CLASS,
    title: `Reject Submission ${submission.participant.name} of ${submission.assignment.title} ${feedback ? ` with feedback: ${feedback}` : ""}`,
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

  const denied = await requireClassManage(
    userId,
    submission.assignment?.module?.session.class.id ?? ""
  );
  if (denied) return denied;
  const classId = submission.assignment?.module?.session.class.id;

  const result = await updateStatusSubmission(
    submissionId,
    SubmissionStatus.APPROVE,
    userId
  );
  await historyApproveFlag({
    module: HistoryModule.CLASS,
    title: `Approve Submission ${submission.participant.name} of ${submission.assignment.title}`,
    actionId: classId,
    createdBy: userId,
  });
  return result;
};
