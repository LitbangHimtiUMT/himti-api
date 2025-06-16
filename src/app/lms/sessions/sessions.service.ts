import { HistoryModule } from "@prisma/client";
import { Query } from "../../../interface/Query";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import {
  historyCreateFlag,
  historyDeleteFlag,
  historyUpdateFlag,
} from "../../history/history.repository";
import { CreateSessionBodyRequest } from "./sessions.dto";
import {
  getSessionMapper,
  getSessionsMapper,
  SessionData,
} from "./sessions.mapper";
import {
  createSessionRepository,
  deleteSessionRepository,
  getDetailSession,
  getSessionByName,
  getSessionsCountRepository,
  getSessionsRepository,
  updateSessionRepository,
} from "./sessions.repository";
import { createSessionValidate } from "./sessions.validate";
import { getModulesByClass } from "../modules/modules.repository";
import {
  BUCKET_FOLDER,
  RemoveFileFromStorage,
} from "../../../utils/upload-file-to-storage";
import { environment } from "../../../libs";

export const createSessionService = async (
  { name, classId }: CreateSessionBodyRequest,
  userId: string
) => {
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

  await historyCreateFlag({
    module: HistoryModule.CLASS,
    title: `New Session ${session.name} on class: ${session.class.name}`,
    actionId: session.class.id,
    createdBy: userId,
  });

  return session;
};

export const updateSessionService = async (
  sessionId: string,
  data: CreateSessionBodyRequest,
  userId: string
) => {
  const session = await getDetailSession(sessionId);

  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const sessionExist = await getSessionByName(data.name, session.class.id);

  if (sessionExist && sessionExist.id !== session.id) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.SESSION_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const result = await updateSessionRepository(sessionId, data);
  if (session.name !== data.name) {
    await historyUpdateFlag({
      module: HistoryModule.CLASS,
      title: `Update Session from ${session.name} to ${result.name} on class: ${session.class.name}`,
      actionId: session.class.id,
      createdBy: userId,
    });
  }
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

export const deleteSessionService = async (sessionId: string, userId: string) => {
  const session = await getDetailSession(sessionId);

  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const modules = await getModulesByClass(session.classId);

  await Promise.all([
    modules.map(async (module) => {
      await Promise.all([
        RemoveFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.modules}/${module.fileModule}`
        ),
        (module?.assignment?.submission ?? [])?.map(async (sub) => {
          if (module?.assignment?.type === "FILE") {
            await RemoveFileFromStorage(
              `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.submission}/${sub.file}`
            );
          }
        }),
      ]);
    }),
    historyDeleteFlag({
      module: HistoryModule.CLASS,
      title: `Delete Session ${session.name} on class: ${session.class.name}`,
      actionId: session.class.id,
      createdBy: userId,
    }),
    deleteSessionRepository(session.id)
  ]);
  return session;
};
