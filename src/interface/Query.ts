import { OrderBy } from "./utils";

export interface Query {
  page?: string;
  perPage?: string;
  search?: string;
  isOpen?: string;
  eventMeetingId?: string;
  status?: string;
  transactionType?: string;
  categoryId?: string;
  classId?: string;
  orderBy?: OrderBy;
  sessionId?: string;
  authType?: "lms" | "app";
}
