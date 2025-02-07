import { Query } from "../../../interface/Query";
import { ErrorApp } from "../../../utils/http-error";
import { Meta } from "../../../utils/meta";
import { CreateSessionBodyRequest } from "./sessions.dto";
import { getSessionsMapper } from "./sessions.mapper";
import {
  createSessionRepository,
  getSessionsCountRepository,
  getSessionsRepository,
} from "./sessions.repository";
import { createSessionValidate } from "./sessions.validate";

export const createSessionService = async ({
  name,
  classId,
}: CreateSessionBodyRequest) => {
  const validate = await createSessionValidate({
    classId,
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

export const getSessionsByClassService = async (query: Query) => {
  const {page = '1', perPage = '10'} = query
  const [sessions, totalData] = await Promise.all([
    getSessionsRepository(query),
    getSessionsCountRepository(query),
  ]);

  const data = getSessionsMapper(sessions)

  return {
    data,
    meta: Meta(
      Number(page), 
      Number(perPage), 
      totalData
    ),
  };
};
