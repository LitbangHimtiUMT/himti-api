import { ClassStatus } from "@prisma/client";

export interface DashboardTotalsDTO {
  classes: number;
  participants: number;
  pendingReviews: number;
  certificates: number;
}

export interface DashboardPerClassDTO {
  id: string;
  name: string;
  status: ClassStatus;
  participants: number;
  pendingReviews: number;
  avgProgress: number;
}

export interface DashboardReviewQueueItemDTO {
  submissionId: string;
  participantName: string;
  classId: string;
  className: string;
  sessionId: string;
  moduleId: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date;
}

export interface DashboardStatsDTO {
  totals: DashboardTotalsDTO;
  perClass: DashboardPerClassDTO[];
  reviewQueue: DashboardReviewQueueItemDTO[];
}
