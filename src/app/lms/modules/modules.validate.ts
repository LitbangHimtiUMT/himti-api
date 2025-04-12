import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { isValidYouTubeUrl } from "../../../utils/validate-url";
import { getSessionById } from "../sessions/sessions.repository";

export const createModuleValidate = async (
  sessionId: string,
  videoUrl?: string
) => {
  const session = await getSessionById(sessionId);
  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (videoUrl) {
    const validUrl = isValidYouTubeUrl(videoUrl);
    if (!validUrl) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.YOUTUBE_URL,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  return session;
};
