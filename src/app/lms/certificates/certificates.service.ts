import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getClassById } from "../classes/classes.repository";
import {
  generateCertificateRepository,
  getCertificateUser,
} from "./certificates.repository";

export const generateCertificateService = async (
  classId: string,
  userId: string
) => {
  const classess = await getClassById(classId, userId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const total = {
    module: 0,
    completed: 0,
  };
  for (const modules of classess.session) {
    total.module += modules.module.length;
    for (const completed of modules.module) {
      total.completed += completed._count?.completedModule ?? 0;
    }
  }
  const percent = (total.completed / total.module) * 100;
  if (percent < 100) {
    return new ErrorApp("Class not completed", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  const certificate = await getCertificateUser(userId, classId);
  if (certificate) {
    return new ErrorApp(
      "Certificate already generated",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await generateCertificateRepository(userId, classId);
};
