import { Level } from "@prisma/client";

export interface CreateClassBodyRequest {
  name?: string;
  description?: string;
  thumbnail?: Express.Multer.File | string;
  level?: Level;
  categoryId?: string;
  price?: number;
}
