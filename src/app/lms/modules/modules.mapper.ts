import {
  Assignment,
  Class,
  CompletedModule,
  Module,
  Session,
  Submission,
  SubmissionStatus,
  User,
} from "@prisma/client";
import {
  BUCKET_FOLDER,
  GetPublicURL,
} from "../../../utils/upload-file-to-storage";
import { youtubeID } from "../../../utils/youtbe-url";
import { ModulesDTO } from "./modules.dto";
import { ImagePath } from "../../../utils/image-path";

export interface ModuleData extends Module {
  assignment:
    | (Assignment & {
        submission: Array<
          Submission & {
            participant: {
              id: string;
              name: string;
            };
          }
        >;
      })
    | null;
  session?: Session & {
    class?: Class & {
      user?: User;
    };
  };
  completedModule: CompletedModule[];
  _count?: {
    completedModule?: number;
  };
}

export const getModulesMapper = (data: ModuleData[]): ModulesDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    file: {
      fileName: item.fileModule,
      url: item.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${item.fileModule}`)
        : null,
    },
    textModule: item.textModule,
    videoUrl: item.videoUrl,
    youtubeId: item.videoUrl ? youtubeID(item.videoUrl) : null,
    thumbnailUrl: item.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(item.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: item.assignment
      ? {
          id: item.assignment?.id,
          title: item.assignment?.title,
          isFinalAssigment: item.assignment?.isFinalAssigment,
          dueDate: item.assignment?.dueDate,
          allowedFile: item.assignment.allowedFile,
          description: item.assignment.description,
        }
      : null,
    isCompleted: !!item.completedModule?.length,
  }));
};
export const getModuleMapper = (data: ModuleData, isCompleted?: boolean): ModulesDTO => {
  const activeSubmission = data.assignment
    ? data.assignment.submission.find(
        (item) => item.status === SubmissionStatus.REVIEW
      ) || null
    : null;
  return {
    id: data.id,
    name: data.name,
    file: {
      fileName: data.fileModule,
      url: data.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${data.fileModule}`)
        : null,
    },
    textModule: data.textModule,
    videoUrl: data.videoUrl,
    isCompleted: !!isCompleted,
    createdBy: {
      id: data.session?.class?.user?.id ?? "",
      name: data.session?.class?.user?.name ?? "",
    },
    youtubeId: data.videoUrl ? youtubeID(data.videoUrl) : null,
    thumbnailUrl: data.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(data.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: data.assignment
      ? {
          id: data.assignment?.id,
          title: data.assignment?.title,
          isFinalAssigment: data.assignment?.isFinalAssigment,
          dueDate: data.assignment?.dueDate,
          description: data.assignment.description,
          historySubmission: data.assignment.submission
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
          activeSubmission: activeSubmission
            ? {
                id: activeSubmission.id,
                file: ImagePath(
                  `${BUCKET_FOLDER.assignments}/${activeSubmission.file}`
                ),
                status: activeSubmission.status,
                feedback: activeSubmission.feedback,
                submittedAt: activeSubmission.createdAt,
                submittedBy: {
                  id: activeSubmission.participant.id,
                  name: activeSubmission.participant.name,
                },
              }
            : null,
        }
      : null,
  };
};
