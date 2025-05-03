import { AssignmentType } from "@prisma/client";

export interface CreateAssignmentDTO {
  title: string;
  description?: string;
  moduleId: string;
  dueDate: Date;
  isFinalAssignment?: boolean;
  type: AssignmentType;
  allowedFile?: string;
}
