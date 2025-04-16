import { ClassStatus, Level } from "@prisma/client";

export interface CreateClassBodyRequest {
  name: string;
  description?: string;
  thumbnail?: Express.Multer.File | string;
  level: Level;
  categoryId: string;
  price: number;
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
