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
  getModuleById,
  getModulesCountRepository,
  getModulesRepository,
} from "./modules.repository";
import { createModuleValidate } from "./modules.validate";

export const createModuleService = async ({
  name,
  sessionId,
  textModule,
  videoUrl,
  fileModule,
}: CreateModuleBodyRequest) => {
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
  const modules = await getModuleById(moduleId, !isMentor ? userId : undefined);
  if (!modules) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const data = getModuleMapper(modules as unknown as ModuleData);
  return data;
};
