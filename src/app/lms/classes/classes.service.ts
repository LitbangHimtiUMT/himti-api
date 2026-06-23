import { ClassStatus, HistoryModule } from "@prisma/client";
import sharp from "sharp";
import { Query } from "../../../interface/Query";
import { environment } from "../../../libs";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { generateBalancedRandomString } from "../../../utils/generate-random-string";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { orderByData } from "../../../utils/query-utils";
import {
  BUCKET_FOLDER,
  FileType,
  GetFileFromStorage,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../../utils/upload-file-to-storage";
import { getUserById } from "../../authentication/auth.repository";
import { createMidtransTransaction } from "../../midtrans/midtrans.service";
import { getPointByUserId } from "../../point/point.repository";
import { getCategoryById } from "../categories/categories.repository";
import {
  createClassParticipantRepository,
  getClassParticipantByUserIdCountRepository,
  getClassParticipantByUserIdRepository,
  getExistingClassParticipantRepository,
} from "../class-participants/class-participants.repository";
import { createTransactionRepository } from "../transactions/transactions.repository";
import { CreateClassBodyRequest, JoinClassInvitationDTO } from "./classes.dto";
import {
  ClassData,
  ClassParticipantData,
  getClassAccessMapper,
  getClassMapper,
  getDetailClassMapper,
} from "./classes.mapper";
import {
  createClassRepository,
  deleteClassRepository,
  getClassByCode,
  getClassById,
  getClassCountRepository,
  getClassRepository,
  updateClassRepository,
  updateStatusClass,
} from "./classes.repository";
import { createClassValidate } from "./classes.validate";
import {
  historyCreateFlag,
  historyDeleteFlag,
  historyUpdateFlag,
} from "../../history/history.repository";
import { getSessionsCountRepository } from "../sessions/sessions.repository";

export const createClassService = async (
  {
    name,
    description,
    thumbnail,
    level,
    categoryId,
    price,
  }: CreateClassBodyRequest,
  userId: string
) => {
  let fileName;

  try {
    const validate = await createClassValidate(
      "create",
      {
        categoryId,
        level,
        thumbnail,
        name,
        price,
        description,
      },
      userId
    );

    if (validate instanceof ErrorApp) {
      return validate;
    }

    const category = await getCategoryById(categoryId as string);

    if (!category) {
      return new ErrorApp("Category not found", 404, MESSAGE_CODE.BAD_REQUEST);
    }

    const img = thumbnail as Express.Multer.File;

    fileName = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;
    const quality =
      ((thumbnail as unknown as Express.Multer.File)?.size as number) >
      5 * 1024 * 1024
        ? 75
        : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();
    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`,
      Body: compress,
      ContentType: "image/webp",
    });
    const code = generateBalancedRandomString();
    const createClass = await createClassRepository(
      {
        name,
        description,
        thumbnail: fileName,
        level,
        categoryId,
        price,
        code,
      },
      userId
    );
    await historyCreateFlag({
      module: HistoryModule.CLASS,
      title: `New Class - ${createClass.name}`,
      actionId: createClass.id,
      createdBy: userId,
    });
    return createClass;
  } catch (error) {
    console.log({
      error,
    });
    const exist = await GetFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
    );
    if (exist.exists) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
      );
    }
    return new ErrorApp(
      "Error when update class data or upload file to storage",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const updateClassService = async (
  classId: string,
  {
    name,
    description,
    thumbnail,
    level,
    categoryId,
    price,
  }: Partial<CreateClassBodyRequest>
) => {
  let fileName;

  try {
    const classess = await getClassById(classId);

    if (!classess) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.CLASS,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
    const validate = await createClassValidate("update", {
      categoryId,
      level,
      thumbnail,
      name,
      price,
      description,
    });

    if (validate instanceof ErrorApp) {
      return validate;
    }

    if (thumbnail) {
      const img = thumbnail as Express.Multer.File;

      fileName = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;
      const quality =
        ((thumbnail as unknown as Express.Multer.File)?.size as number) >
        5 * 1024 * 1024
          ? 75
          : 100;
      const compress = await sharp(img.buffer).webp({ quality }).toBuffer();
      const exist = await GetFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${classess.thumbnail}`
      );
      if (exist.exists) {
        await RemoveFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${classess.thumbnail}`
        );
      }
      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`,
        Body: compress,
        ContentType: "image/webp",
      });
    }
    const createClass = await updateClassRepository(classess.id, {
      name,
      description,
      thumbnail: fileName ? fileName : undefined,
      categoryId,
      price,
      level,
    });

    return createClass;
  } catch (error) {
    console.log({
      error,
    });
    const exist = await GetFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
    );
    if (exist.exists) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
      );
    }
    return new ErrorApp(
      "Error when create class data or upload file to storage",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const getClassService = async (query: Query, userId?: string) => {
  const { page = "1", perPage = "10", orderBy } = query;

  if (orderBy && !orderByData.includes(orderBy)) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ORDER_BY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const [classess, totalData] = await Promise.all([
    getClassRepository(query, userId),
    getClassCountRepository(query, userId),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: getClassMapper(classess as ClassData[]),
    meta,
  };
};

export const getClassUserService = async (userId: string, query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [classes, totalData] = await Promise.all([
    getClassParticipantByUserIdRepository(userId, query),
    getClassParticipantByUserIdCountRepository(userId, query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: getClassAccessMapper(
      classes as unknown as ClassParticipantData[],
      userId
    ),
    meta,
  };
};

export const userJoinClassService = async (userId: string, classId: string) => {
  const classess = await getClassById(classId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (classess.status !== "PUBLISH") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_PUBLISH_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const alreadyJoin = await getExistingClassParticipantRepository(
    classId,
    userId
  );

  if (alreadyJoin) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ALREADY_JOIN_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (Number(classess.price)) {
    const [point, user] = await Promise.all([
      getPointByUserId(userId),
      getUserById(userId),
    ]);

    if (!user) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }

    if (Number(point._sum.point) < 300) {
      const transactionId = `TRX-${+new Date()}`;
      const midtransTransaction = await createMidtransTransaction({
        customer_details: {
          email: user.email,
          name: user.name,
        },
        item_details: [
          {
            name: classess.name,
            quantity: 1,
            price: Number(classess.price),
          },
        ],
        transaction_details: {
          order_id: transactionId,
          gross_amount: Number(classess.price),
        },
      });
      if (midtransTransaction instanceof ErrorApp) {
        return midtransTransaction;
      }
      await createTransactionRepository({
        amount: Number(classess.price),
        classId: classess.id,
        uniqueCode: transactionId,
        userId: user.id,
      });
      return {
        ...midtransTransaction.data,
      };
    }
    await createClassParticipantRepository(
      {
        classId: classess.id,
      },
      userId
    );
    return undefined;
  }

  await createClassParticipantRepository(
    {
      classId: classess.id,
    },
    userId
  );
  return undefined;
};

export const getDetailClassService = async (
  query: Query,
  classId: string,
  userId?: string
) => {
  const { page = "1", perPage = "10" } = query;
  const classess = await getClassById(classId, userId, query);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const session = await getSessionsCountRepository({
    ...query,
    classId,
  });
  const meta = Meta(Number(page), Number(perPage), session);
  return {
    data: await getDetailClassMapper(classess as ClassData),
    meta,
  };
};

export const getDetailClassByCodeService = async (
  userId: string,
  code: string
) => {
  const classess = await getClassByCode(atob(code));
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const alreadyJoin = await getExistingClassParticipantRepository(
    classess.id,
    userId
  );

  return await getDetailClassMapper({
    ...classess,
    isAlreadyJoin: !!alreadyJoin,
  } as ClassData);
};

export const joinInvitationClassService = async (
  userId: string,
  data: JoinClassInvitationDTO
) => {
  const classess = await getClassByCode(atob(data.code));
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.INVITATION_CODE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (classess.createdBy === userId) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.MENTOR_JOIN_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const alreadyJoin = await getExistingClassParticipantRepository(
    classess.id,
    userId
  );

  if (alreadyJoin) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ALREADY_JOIN_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (classess.status !== "PUBLISH") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_PUBLISH_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const result = await createClassParticipantRepository(
    {
      classId: classess.id,
    },
    userId
  );
  await historyCreateFlag({
    module: HistoryModule.CLASS,
    title: `Join class ${classess.name}`,
    actionId: result.id,
    createdBy: userId,
  });
  return {
    classId: result.classId,
  };
};

export const publishClassService = async (classId: string, userId: string) => {
  const classess = await getClassById(classId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (classess.createdBy !== userId) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.CREATOR_PUBLISH,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  historyUpdateFlag({
    module: HistoryModule.CLASS,
    title: `Publish class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return await updateStatusClass(classess.id, ClassStatus.PUBLISH);
};

export const deleteClassessService = async (
  classId: string,
  userId: string
) => {
  const classess = await getClassById(classId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (classess.createdBy !== userId) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.DELETE_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  await historyDeleteFlag({
    module: HistoryModule.CLASS,
    title: `Delete class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return await deleteClassRepository(classess.id);
};
