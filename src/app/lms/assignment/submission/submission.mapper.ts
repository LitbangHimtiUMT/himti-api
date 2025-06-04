import {
  Assignment,
  Class,
  Module,
  Session,
  Submission,
  User,
} from "@prisma/client";
import { ImagePath } from "../../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../../utils/upload-file-to-storage";

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
  mentor: User | null;
}

export const getSubmissionMapper = (data: SubmissionData) => {
  return {
    id: data.id,
    submittedBy: data.userId,
    file: data.file,
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
