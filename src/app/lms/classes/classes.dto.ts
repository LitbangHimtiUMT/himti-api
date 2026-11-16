import { ClassStatus, Level } from "@prisma/client";
import { ClassRatingAggregate } from "../reviews/reviews.dto";

export interface CreateClassBodyRequest {
  name: string;
  description?: string;
  thumbnail?: Express.Multer.File | string;
  level: Level;
  categoryId: string;
  price: number;
}

interface ModuleClassDTO {
  id: string;
  name: string;
  fileModule: string | null;
  textModule: string | null;
  videoUrl: string | null;
}

interface SessionClassDTO {
  id: string;
  name: string;
  modules: ModuleClassDTO[];
}

export interface ClassDTO {
  id: string;
  name: string;
  description: string | null;
  status: ClassStatus;
  completedAt?: Date | string | null;
  totalCertificates?: number;
  rating?: ClassRatingAggregate | null;
  totalParticipant: number;
  isAlreadyJoin?: boolean
  level: Level;
  createdAt?: Date | string;
  category: {
    id: string;
    name: string;
  };
  sessions?: SessionClassDTO[]
  code: string;
  thumbnailFileSize?: number
  thumbnail: string | null;
  price: number;
  creator: {
    id: string;
    name: string;
    email: string;
    photo: string | null;
  };
}

export interface JoinClassInvitationDTO {
  code: string;
}
