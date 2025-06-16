import sharp from "sharp";
import { Query } from "../../../interface/Query";
import { environment } from "../../../libs";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import {
  BUCKET_FOLDER,
  FileType,
  GetFileFromStorage,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../../utils/upload-file-to-storage";
import { getSessionById } from "../sessions/sessions.repository";
import { CreateModuleBodyRequest } from "./modules.dto";
import {
  getModuleMapper,
  getModulesMapper,
  ModuleData,
} from "./modules.mapper";
import {
  createModuleRepository,
  deleteModuleRepository,
  getModuleById,
  getModulesCountRepository,
  getModulesRepository,
} from "./modules.repository";
import { createModuleValidate } from "./modules.validate";
import {
  historyCreateFlag,
  historyDeleteFlag,
} from "../../history/history.repository";
import { HistoryModule } from "@prisma/client";
import { getMentorByClassRepository } from "../class-mentor/class-mentor.repository";

export const createModuleService = async (
  {
    name,
    sessionId,
    textModule,
    videoUrl,
    fileModule,
  }: CreateModuleBodyRequest,
  userId: string
) => {
  let fileName: string | undefined = undefined;
  try {
    const validate = await createModuleValidate(sessionId);

    if (validate instanceof ErrorApp) {
      return validate;
    }
    if (fileModule) {
      let buffer = fileModule.buffer;
      fileName = `${fileModule?.originalname.replace(FileType[fileModule.mimetype], "")} - ${+new Date()}${FileType[fileModule.mimetype]}`;
      const quality = (fileModule?.size as number) > 5 * 1024 * 1024 ? 75 : 100;
      const formatFile = FileType[fileModule.mimetype];
      if (
        formatFile === ".jpeg" ||
        formatFile === ".jpg" ||
        formatFile === ".png"
      ) {
        buffer = await sharp(fileModule.buffer).webp({ quality }).toBuffer();
      }

      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.modules}/${fileName}`,
        Body: buffer,
        ContentType: fileModule.mimetype,
        ACL: "public-read",
      });
    }

    const moduleService = await createModuleRepository({
      name,
      sessionId: validate.id,
      textModule,
      videoUrl,
      fileModule: fileName,
    });
    await historyCreateFlag({
      module: HistoryModule.CLASS,
      title: `New Module ${moduleService.name} on session: ${moduleService.session.name}, class: ${moduleService.session.class.name}`,
      actionId: moduleService.session.class.id,
      createdBy: userId,
    });
    return moduleService;
  } catch (error) {
    console.log({
      error,
    });
    if (fileName) {
      const exist = await GetFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.modules}/${fileName}`
      );
      if (exist.exists) {
        await RemoveFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.modules}/${fileName}`
        );
      }
    }
    return new ErrorApp(
      "Error when create class data or upload file to storage",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const getModulesService = async (query: Query, userId: string) => {
  const { page = "1", perPage = "10", sessionId } = query;

  const session = await getSessionById(sessionId ?? "");

  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const [modules, totalData] = await Promise.all([
    getModulesRepository(query, userId),
    getModulesCountRepository(query),
  ]);

  const data = getModulesMapper(modules as ModuleData[]);
  return {
    data,
    meta: Meta(Number(page), Number(perPage), totalData),
  };
};

export const getDetailModuleService = async (
  moduleId: string,
  userId: string,
  isMentor: boolean
) => {
  const modules = await getModuleById(moduleId, userId, isMentor);
  if (!modules) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const isCompleted = !!modules.completedModule.length;
  const data = getModuleMapper(modules as unknown as ModuleData, isCompleted);
  return data;
};

export const deleteModuleService = async (moduleId: string, userId: string) => {
  const modules = await getModuleById(moduleId);
  if (!modules) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const classId = modules?.session?.class?.id;
  if (classId) {
    const mentors = await getMentorByClassRepository(classId, {});
    const isJoin = mentors.find((item) => item.userId === userId);
    if (userId !== modules?.session?.class?.createdBy && !isJoin) {
      return new ErrorApp(
        MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
        403,
        MESSAGE_CODE.FORBIDDEN
      );
    }
  }

  await historyDeleteFlag({
    module: HistoryModule.CLASS,
    title: `Delete Module ${modules?.name ?? "-"} on session: ${modules?.session?.name ?? "-"}, class: ${modules?.session.class.name ?? "-"}`,
    actionId: modules?.session.class.id,
    createdBy: userId,
  });
  return await Promise.all([
    ...(modules?.assignment?.type === "FILE"
      ? (modules?.assignment?.submission ?? []).map(async (item) => {
          if (modules?.assignment?.type) {
            await RemoveFileFromStorage(
              `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.submission}/${item.file}`
            );
          }
        })
      : []),
    deleteModuleRepository(moduleId),
  ]);
};
