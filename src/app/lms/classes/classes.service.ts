import { ClassStatus, HistoryModule, Prisma } from "@prisma/client";
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
  countClassCertificatesRepository,
  countClassTransactionsRepository,
  createClassRepository,
  deleteClassRepository,
  getClassByCode,
  getClassById,
  getClassCountRepository,
  getClassRepository,
  markClassCompletedRepository,
  updateClassRepository,
  updateStatusClass,
} from "./classes.repository";
import { getCertificatesCountByClassRepository } from "../certificates/certificates.repository";
import { getClassRatingsRepository } from "../reviews/reviews.repository";
import { ClassRatingAggregate } from "../reviews/reviews.dto";
import { createClassValidate } from "./classes.validate";
import {
  historyCreateFlag,
  historyDeleteFlag,
  historyUpdateFlag,
} from "../../history/history.repository";
import {
  canAccessClass,
  isAdminRole,
  isClassMentor,
  requireClassCreatorOrAdmin,
  requireClassManage,
  requireNotCompleted,
} from "../../../utils/lms-access";

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
  }: Partial<CreateClassBodyRequest>,
  userId?: string
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
    // Previously update had NO ownership check at all: any
    // authenticated user could rewrite any class. Creator, mentor
    // of the class, or admin only.
    if (userId) {
      const denied = await requireClassManage(userId, classId);
      if (denied) return denied;
    }
    // Completed classes are frozen: metadata cannot change.
    const locked = await requireNotCompleted(classId);
    if (locked) return locked;
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

  // One groupBy for the whole page: rating aggregates ride along with
  // the list instead of one query per class. An empty page skips the
  // query entirely.
  const ratings = new Map<string, ClassRatingAggregate>();
  if (classess.length > 0) {
    const ratingRows = await getClassRatingsRepository(
      classess.map((klass) => klass.id)
    );
    for (const row of ratingRows) {
      ratings.set(row.classId, {
        average:
          row._avg.rating === null
            ? null
            : Number(row._avg.rating.toFixed(2)),
        count: row._count._all,
      });
    }
  }

  return {
    data: getClassMapper(classess as ClassData[], ratings),
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
  // The PUBLISH check already blocks ARCHIVED classes; completed
  // classes need their own check because completion is a separate
  // flag that leaves the status at PUBLISH.
  const locked = await requireNotCompleted(classId);
  if (locked) return locked;

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
  const classess = await getClassById(classId, userId, query);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  // Guests and non-members only see PUBLISH classes, whatever the
  // completed flag is. Members (participants, mentors, admins) see
  // every status, including DRAFT and ARCHIVED. A 404 — not 403 —
  // keeps unpublished classes invisible instead of confirming that
  // a class with this id exists.
  if (classess.status !== "PUBLISH") {
    if (!userId || !(await canAccessClass(userId, classess.id))) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.CLASS,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }
  const alreadyJoin = userId
    ? await getExistingClassParticipantRepository(classess.id, userId)
    : null;
  // Same shape as isAlreadyJoin: guests (no token) are never the
  // class mentor. The LMS enables the certificate section for
  // participants OR mentors from these two flags.
  const classMentor = userId
    ? await isClassMentor(userId, classess.id)
    : false;
  const totalCertificates = await getCertificatesCountByClassRepository(
    classess.id
  );

  // Detail returns every session in one payload, so meta describes a
  // single page holding all of them; perPage never drops to 0 on an
  // empty class, which would make totalPages NaN.
  const sessionCount = classess.session.length;
  const meta = Meta(1, Math.max(sessionCount, 1), sessionCount);
  return {
    data: await getDetailClassMapper({
      ...classess,
      isAlreadyJoin: !!alreadyJoin,
      isClassMentor: classMentor,
      totalCertificates,
    } as ClassData),
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
  // Same visibility rule as the id detail: an invitation code is not
  // a pass to preview an unpublished class. Joining requires PUBLISH
  // anyway, so a non-member has no use for a DRAFT/ARCHIVED preview.
  if (
    classess.status !== "PUBLISH" &&
    !(await canAccessClass(userId, classess.id))
  ) {
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
  const classMentor = await isClassMentor(userId, classess.id);
  const totalCertificates = await getCertificatesCountByClassRepository(
    classess.id
  );

  return await getDetailClassMapper({
    ...classess,
    isAlreadyJoin: !!alreadyJoin,
    isClassMentor: classMentor,
    totalCertificates,
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
  const locked = await requireNotCompleted(classess.id);
  if (locked) return locked;
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
    // Creator-only before; admins may now also publish (e.g. when
    // the creator account is gone). Mentors who are not the creator
    // still cannot publish someone else's class, so this is an
    // admin-only bypass, not the general manage check.
    const isAdmin = await isAdminRole(userId);
    if (!isAdmin) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.CREATOR_PUBLISH,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }
  // Publish is DRAFT-only: an archived class returns via unarchive,
  // never by publishing again.
  if (classess.status !== ClassStatus.DRAFT) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_DRAFT_PUBLISH,
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

export const archiveClassService = async (classId: string, userId: string) => {
  const classess = await getClassById(classId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const denied = await requireClassCreatorOrAdmin(userId, classess.createdBy);
  if (denied) return denied;
  if (classess.status !== ClassStatus.PUBLISH) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_PUBLISH_ARCHIVE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  // Archiving does not lock content and does not touch completedAt:
  // an archived class can still be edited and unarchived.
  historyUpdateFlag({
    module: HistoryModule.CLASS,
    title: `Archive class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return await updateStatusClass(classess.id, ClassStatus.ARCHIVED);
};

export const unarchiveClassService = async (
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
  const denied = await requireClassCreatorOrAdmin(userId, classess.createdBy);
  if (denied) return denied;
  if (classess.status !== ClassStatus.ARCHIVED) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_ARCHIVED_UNARCHIVE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  // completedAt is left untouched: unarchiving never un-completes.
  historyUpdateFlag({
    module: HistoryModule.CLASS,
    title: `Unarchive class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return await updateStatusClass(classess.id, ClassStatus.PUBLISH);
};

export const completeClassService = async (
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
  const denied = await requireClassCreatorOrAdmin(userId, classess.createdBy);
  if (denied) return denied;
  if (
    classess.status !== ClassStatus.PUBLISH &&
    classess.status !== ClassStatus.ARCHIVED
  ) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_PUBLISHED_COMPLETE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  if (classess.completedAt) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.CLASS_ALREADY_COMPLETED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  historyUpdateFlag({
    module: HistoryModule.CLASS,
    title: `Complete class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return await markClassCompletedRepository(classess.id);
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
  const denied = await requireClassManage(userId, classId);
  if (denied) return denied;
  // Issued certificates must stay verifiable and transactions are financial
  // records, so a class that has either cannot be deleted at all. Mentor
  // links and meeting links are removed by the foreign keys instead.
  const certificateCount = await countClassCertificatesRepository(classId);
  if (certificateCount > 0) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.CLASS_HAS_CERTIFICATES,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const transactionCount = await countClassTransactionsRepository(classId);
  if (transactionCount > 0) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.CLASS_HAS_TRANSACTIONS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  let deleted;
  try {
    deleted = await deleteClassRepository(classess.id);
  } catch (error) {
    // A certificate or transaction created between the checks above and the
    // delete still hits the foreign key: report it as the same 400 instead
    // of leaking a database error as a 500.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.CLASS_DELETE_HAS_LINKED_DATA,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    throw error;
  }
  // History is written only after the delete succeeds, so a failed delete
  // never leaves a "Delete class" entry behind.
  await historyDeleteFlag({
    module: HistoryModule.CLASS,
    title: `Delete class ${classess.name}`,
    actionId: classess.id,
    createdBy: userId,
  });
  return deleted;
};
