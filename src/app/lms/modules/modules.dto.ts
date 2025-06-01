import { SubmissionStatus } from "@prisma/client";

export interface CreateModuleBodyRequest {
  name: string;
  sessionId: string;
  textModule?: string;
  videoUrl?: string;
  fileModule?: Express.Multer.File;
}

interface SubmissionDTO {
  id: string;
  file: string;
  status: SubmissionStatus;
  feedback: string | null;
  submittedAt: Date;
  submittedBy?: {
    id: string;
    name: string;
  }
}

export interface ModulesDTO {
  id: string;
  name: string;
  textModule: string | null;
  videoUrl: string | null;
  file: {
    fileName: string | null;
    url: string | null;
  };
  youtubeId: string | null;
  thumbnailUrl: string | null;
  createdBy?: {
    id: string;
    name: string;
  };
  assignment: {
    id: string;
    title: string;
    isFinalAssigment: boolean;
    dueDate: Date;
    description: string | null;
    historySubmission?: SubmissionDTO[];
    activeSubmission?: SubmissionDTO | null;
  } | null;
}
