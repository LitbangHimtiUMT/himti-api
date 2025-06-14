import { Query } from "../../../interface/Query";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { CreateSessionBodyRequest } from "./sessions.dto";
import {
  getSessionMapper,
  getSessionsMapper,
  SessionData,
} from "./sessions.mapper";
import {
  createSessionRepository,
  getDetailSession,
  getSessionsCountRepository,
  getSessionsRepository,
  updateSessionRepository,
} from "./sessions.repository";
import { createSessionValidate } from "./sessions.validate";

export const createSessionService = async ({
  name,
  classId,
}: CreateSessionBodyRequest) => {
  const validate = await createSessionValidate({
    classId,
    name,
  });

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const session = await createSessionRepository({
    name,
    classId,
  });

  return session;
};

export const updateSessionService = async (
  sessionId: string,
  data: CreateSessionBodyRequest
) => {
  const session = await getDetailSession(sessionId);

  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const result = await updateSessionRepository(sessionId, data);

  return result;
};

export const getSessionsByClassService = async (
  query: Query,
  userId: string
) => {
  const { page = "1", perPage = "10" } = query;
  const [sessions, totalData] = await Promise.all([
    getSessionsRepository(query, userId),
    getSessionsCountRepository(query),
  ]);

  const data = getSessionsMapper(sessions as SessionData[]);

  return {
    data,
    meta: Meta(Number(page), Number(perPage), totalData),
  };
};

export const getSessionService = async (sessionId: string) => {
  const session = await getDetailSession(sessionId);

  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  return getSessionMapper(session as SessionData);
};
