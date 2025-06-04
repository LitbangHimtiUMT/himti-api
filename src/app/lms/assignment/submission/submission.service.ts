import { MESSAGE_CODE } from "../../../../utils/error-code";
import { ErrorApp } from "../../../../utils/http-error";
import { MESSAGES } from "../../../../utils/messages";
import { getSubmissionMapper, SubmissionData } from "./submission.mapper";
import { getSubmissionByIdRepository } from "./submission.repository";

export const getSubmissionByIdService = async (id: string) => {
  const submission = await getSubmissionByIdRepository(id);
  if (!submission) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUBMISSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  submission.assignment.module
  return getSubmissionMapper(submission as unknown as SubmissionData);
};
