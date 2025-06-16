import {
  Assignment,
  AssignmentType,
  Class,
  Module,
  Session,
  Submission,
  User,
} from "@prisma/client";
import { ImagePath } from "../../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../../utils/upload-file-to-storage";
import { checkDueDate } from "../../../../utils/generate-open";

export interface SubmissionData extends Submission {
  assignment: Assignment & {
    module: Module & {
      session: Session & {
        class: Class & {
          user: User;
        };
      };
    };
  };
  participant: User;
  mentor: User | null;
}

export const getSubmissionMapper = (data: SubmissionData) => {
  return {
    id: data.id,
    submittedBy: data.userId,
    file:
      data.assignment.type === AssignmentType.FILE
        ? ImagePath(`${BUCKET_FOLDER.submission}/${data.file}`)
        : data.file,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    assignment: data.assignment,
    actionBy: data.mentor
      ? {
          id: data.mentor.id,
          name: data.mentor.name,
        }
      : null,
    createdBy: {
      id: data.assignment.module.session.class.user.id,
      name: data.assignment.module.session.class.user.name,
    },
    isOpen: checkDueDate(new Date(data.assignment.dueDate)),
    module: {
      id: data.assignment.module.id,
      name: data.assignment.module.name,
      fileModule: data.assignment.module.fileModule
        ? ImagePath(
            `${BUCKET_FOLDER.modules}/${data.assignment.module.fileModule}`
          )
        : null,
      textModule: data.assignment.module.textModule,
      videoUrl: data.assignment.module.videoUrl,
    },
  };
};

export const getSubmissionsMapper = (data: SubmissionData[]) => {
  return data.map((item) => ({
    id: item.id,
    status: item.status,
    assignment: {
      id: item.assignment.id,
      type: item.assignment.type,
    },
    isOpen: checkDueDate(new Date(item.assignment.dueDate)),
    user: {
      id: item.participant.id,
      name: item.participant.name,
      email: item.participant.email,
      photo: item.participant.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${item.participant.photo}`)
        : null,
    },
    createdAt: item.createdAt,
    file:
      item.assignment.type === AssignmentType.FILE
        ? ImagePath(`${BUCKET_FOLDER.submission}/${item.file}`)
        : item.file,
  }));
};
