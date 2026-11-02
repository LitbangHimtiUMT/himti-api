import { Query } from "../../interface/Query";

export interface SubAcaraBodyDTO {
  name?: string;
  description?: string;
  image?: Express.Multer.File | string;
  startTime?: Date | string;
  endTime?: Date | string;
  isOpenAbsen?: boolean | string;
  eventId?: string;
}

export interface SubAcaraQuery extends Query {
  eventId?: string;
}
