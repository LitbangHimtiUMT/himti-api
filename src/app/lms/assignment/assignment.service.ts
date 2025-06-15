import {
  AssignmentType,
  HistoryModule,
  SubmissionStatus,
} from "@prisma/client";
import { environment } from "../../../libs";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { checkDueDate } from "../../../utils/generate-open";
import { ErrorApp } from "../../../utils/http-error";
import { ImagePath } from "../../../utils/image-path";
import { MESSAGES } from "../../../utils/messages";
import {
  BUCKET_FOLDER,
  FileType,
  getFileExtension,
  UploadFileToStorage,
} from "../../../utils/upload-file-to-storage";
import {
  historyCreateFlag,
  historyUpdateFlag,
} from "../../history/history.repository";
import { getMentorByClassRepository } from "../class-mentor/class-mentor.repository";
import { getModuleById } from "../modules/modules.repository";
import { CreateAssignmentDTO, SubmissionCreationDTO } from "./assignment.dto";
import {
  createAssignmentRepository,
  getAssignmentDetailRepository,
  updateAssignmentRepository,
} from "./assignment.repository";
import { createSubmissionRepository } from "./submission/submission.repository";

export const createAssignmentService = async (
  moduleId: string,
  data: Omit<CreateAssignmentDTO, "moduleId">,
  userId: string
) => {
  const modules = await getModuleById(moduleId);
  if (!modules) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const mentors = await getMentorByClassRepository(
    modules.session.class.id,
    {}
  );
  const isJoin = mentors.find((item) => item.userId === userId);
  if (userId !== modules.session.class.createdBy && !isJoin) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  const isOpen = checkDueDate(new Date(data.dueDate));

  if (!isOpen) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.DUE_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  await historyCreateFlag({
    module: HistoryModule.CLASS,
    title: `New Assignment on modules: ${modules.name}, session: ${modules.session.name}, class: ${modules.session.class.name}`,
    actionId: modules.session.class.id,
    createdBy: userId,
  });
  return await createAssignmentRepository({
    dueDate: data.dueDate,
    title: data.title,
    description: data.description,
    moduleId,
    isFinalAssignment: data.isFinalAssignment,
    type: data.type,
    allowedFile: data.allowedFile,
  });
};

export const updateAssignmentService = async (
  assignmentId: string,
  data: Omit<CreateAssignmentDTO, "moduleId">,
  userId: string
) => {
  const assignment = await getAssignmentDetailRepository(assignmentId);
  if (!assignment) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ASSIGNMENT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const mentors = await getMentorByClassRepository(
    assignment.module?.session?.class?.id ?? "",
    {}
  );
  const isJoin = mentors.find((item) => item.userId === userId);
  if (userId !== assignment?.module?.session.class.createdBy && !isJoin) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  const isOpen = checkDueDate(new Date(data.dueDate));
  if (!isOpen) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.DUE_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (data.title !== assignment.title) {
    await historyUpdateFlag({
      module: HistoryModule.CLASS,
      title: `Update Assignment from ${assignment.title} to ${data.title}`,
      actionId: assignment?.module?.session.class.id ?? "",
      createdBy: userId,
    });
  }
  return await updateAssignmentRepository(assignment.id, {
    dueDate: data.dueDate,
    title: data.title,
    description: data.description,
    isFinalAssignment: data.isFinalAssignment,
    type: data.type,
    allowedFile: data.allowedFile,
  });
};

export const getAssignmentByIdService = async (
  assignmentId: string,
  userId: string
) => {
  const assignment = await getAssignmentDetailRepository(assignmentId, userId);
  if (!assignment) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const activeSubmission = assignment
    ? assignment.submission.find(
        (item) => item.status === SubmissionStatus.REVIEW
      ) || null
    : null;
  const active = activeSubmission
    ? {
        ...activeSubmission,
        file: ImagePath(`${BUCKET_FOLDER.submission}/${activeSubmission.file}`),
        isOpen: checkDueDate(new Date(assignment.dueDate)),
      }
    : null;
  const { module: modules, ...rest } = assignment;
  return {
    ...rest,
    isOpen: checkDueDate(new Date(assignment.dueDate)),
    module: {
      id: modules?.id,
      name: modules?.name,
      fileModule: modules?.fileModule
        ? ImagePath(`${BUCKET_FOLDER.modules}/${modules?.fileModule}`)
        : null,
      textModule: modules?.textModule,
      videoUrl: modules?.videoUrl,
    },
    createdBy: {
      id: modules?.session?.class?.user?.id,
      name: modules?.session?.class?.user?.name,
      photo: modules?.session?.class?.user?.photo
        ? ImagePath(
            `${BUCKET_FOLDER.user}/${modules?.session?.class?.user?.photo}`
          )
        : null,
    },
    historySubmission: assignment?.submission
      .filter((item) => item.status !== SubmissionStatus.REVIEW)
      .map((item) => ({
        id: item.id,
        file: ImagePath(`${BUCKET_FOLDER.assignments}/${item.file}`),
        status: item.status,
        feedback: item.feedback,
        submittedAt: item.createdAt,
        submittedBy: {
          id: item.participant.id,
          name: item.participant.name,
        },
      })),
    activeSubmission: active,
  };
};

export const submitAssignmentService = async (
  data: Omit<SubmissionCreationDTO, "file"> & {
    file: string | Express.Multer.File;
  }
) => {
  let fileName = "";
  const assignment = await getAssignmentDetailRepository(data.assignmentId);

  if (!assignment) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ASSIGNMENT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const alreadyReview = assignment.submission
    .filter((item) => item.userId === data.submittedBy)
    .find((item) => item.status === SubmissionStatus.REVIEW);

  if (alreadyReview) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.HAS_REVIEW_SUBMISION,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const isOpen = checkDueDate(new Date(assignment.dueDate));
  if (!isOpen) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.SUBMISSION_DUE_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (assignment.type === AssignmentType.URL && typeof data.file !== "string") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.SUBMISSION_URL,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (
    assignment.type === AssignmentType.FILE &&
    typeof data.file === "string"
  ) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.SUBMISSION_FILE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (
    assignment.type &&
    assignment.type === AssignmentType.FILE &&
    typeof data.file === "object"
  ) {
    if (data.file.size > 3 * 1024 * 1024) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.SUBMISSION_FILE_SIZE,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    const ext = getFileExtension(data.file.mimetype, data.file.originalname);
    fileName = `${data.file?.originalname.replace(ext, "")} - ${+new Date()}${ext}`;
    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.submission}/${fileName}`,
      Body: data.file.buffer,
      ContentType: FileType[data.file.mimetype],
      ACL: "public-read",
    });
  } else {
    fileName = data.file as string;
  }
  await historyCreateFlag({
    module: HistoryModule.CLASS,
    title: `Submit Assignment on modules: ${assignment?.module?.name ?? "-"}, session: ${assignment?.module?.session?.name ?? "-"}, class: ${assignment?.module?.session.class.name ?? "-"}`,
    actionId: assignment?.module?.session.class.id,
    createdBy: data.submittedBy,
  });
  return await createSubmissionRepository({
    assignmentId: assignment.id,
    submittedBy: data.submittedBy,
    file: fileName,
  });
};
