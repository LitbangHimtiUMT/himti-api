import { AssignmentType, SubmissionStatus } from "@prisma/client";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getModuleById } from "../modules/modules.repository";
import { CreateAssignmentDTO, SubmissionCreationDTO } from "./assignment.dto";
import {
  createAssignmentRepository,
  getAssignmentByIdRepository,
  getAssignmentDetailRepository,
} from "./assignment.repository";
import { ImagePath } from "../../../utils/image-path";
import {
  BUCKET_FOLDER,
  FileType,
  UploadFileToStorage,
} from "../../../utils/upload-file-to-storage";
import { environment } from "../../../libs";
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

  if (userId !== modules.session.class.createdBy) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ASSIGNMENT,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  if (new Date() > new Date(data.dueDate)) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.DUE_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

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
        (item) => item.status === SubmissionStatus.REVIEWED
      ) || null
    : null;
  const { module: modules, ...rest } = assignment;
  return {
    ...rest,
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
    activeSubmission,
  };
};

export const submitAssignmentService = async (
  data: Omit<SubmissionCreationDTO, "file"> & {
    file: string | Express.Multer.File;
  }
) => {
  let fileName = "";
  const assignment = await getAssignmentByIdRepository(data.assignmentId);

  if (!assignment) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ASSIGNMENT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (new Date() > new Date(assignment.dueDate)) {
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
    if (data.file.size > 10 * 1024 * 1024) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.SUBMISSION_FILE_SIZE,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    fileName = `${data.file?.originalname.replace(FileType[data.file.mimetype], "")} - ${+new Date()}${FileType[data.file.mimetype]}`;
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

  return await createSubmissionRepository({
    assignmentId: assignment.id,
    submittedBy: data.submittedBy,
    file: fileName,
  });
};
