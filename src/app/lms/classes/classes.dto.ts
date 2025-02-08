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
  level: Level;
  category: {
    id: string;
    name: string;
  };
  thumbnail: string | null;
  price: number;
  creator: {
    id: string;
    name: string;
    email: string;
    photo: string | null;
  };
}
