export interface CreateAssignmentDTO {
  title: string;
  description?: string;
  moduleId: string;
  dueDate: Date;
  isFinalAssignment?: boolean;
}
