import { ClassStatus, Level } from "@prisma/client";

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
  totalParticipant: number;
  isAlreadyJoin?: boolean
  level: Level;
  category: {
    id: string;
    name: string;
  };
  sessions?: SessionClassDTO[]
  code: string;
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
