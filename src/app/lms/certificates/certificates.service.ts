import { ClassStatus, SubmissionStatus } from "@prisma/client";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import {
  canManageClass,
  isClassParticipant,
} from "../../../utils/lms-access";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import {
  AssignmentEligibility,
  CertificateEligibilityDTO,
  CertificateEligibilityResult,
  CertificateQuery,
} from "./certificates.interface";
import { getCertificatesMapper } from "./certificates.mapper";
import {
  generateCertificateRepository,
  getCertificatesCountRepository,
  getCertificatesRepository,
  getCertificateUser,
  getClassAssignmentsRepository,
  getClassForEligibilityRepository,
  getUserSubmissionsByAssignmentsRepository,
} from "./certificates.repository";

/**
 * Single graduation check (M30-SPESIAL §1.1), shared by generate and
 * eligibility. A participant graduates iff: enrolled in the class,
 * not a class manager (creator, co-mentor, or admin), the class is
 * not DRAFT, the mentor has marked the class completed, the class
 * has at least one assignment, and every assignment has an APPROVE
 * submission from them. Module completion counts are deliberately
 * NOT consulted.
 *
 * Counting is per assignment, never per submission row: submissions
 * have no unique constraint, so one assignment with several rows
 * still counts once.
 */
export const getCertificateEligibility = async (
  userId: string,
  classId: string
): Promise<CertificateEligibilityResult> => {
  const klass = await getClassForEligibilityRepository(classId);
  if (!klass) {
    return { kind: "not-found" };
  }
  if (!(await isClassParticipant(userId, classId))) {
    return { kind: "forbidden" };
  }

  const assignments = await getClassAssignmentsRepository(classId);
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const [submissions, certificate, isManager] = await Promise.all([
    getUserSubmissionsByAssignmentsRepository(userId, assignmentIds),
    getCertificateUser(userId, classId),
    canManageClass(userId, classId),
  ]);

  // Submissions arrive latest-first, so the first row seen per
  // assignment is its latest. APPROVE is checked separately: any
  // APPROVE row marks the assignment approved even if a later row
  // existed (unreachable in practice — APPROVE blocks resubmits).
  const latestByAssignment = new Map<string, SubmissionStatus>();
  const approvedIds = new Set<string>();
  for (const submission of submissions) {
    if (submission.status === SubmissionStatus.APPROVE) {
      approvedIds.add(submission.assignmentId);
    }
    if (!latestByAssignment.has(submission.assignmentId)) {
      latestByAssignment.set(submission.assignmentId, submission.status);
    }
  }

  const mapped: AssignmentEligibility[] = assignments.map((assignment) => {
    const latest = latestByAssignment.get(assignment.id);
    return {
      id: assignment.id,
      title: assignment.title,
      moduleId: assignment.moduleId,
      // The module relation is nullable in the schema, but moduleId
      // is a required foreign key, so a missing module is
      // unreachable; the empty string only satisfies the type.
      moduleName: assignment.module?.name ?? "",
      status: approvedIds.has(assignment.id)
        ? "APPROVED"
        : latest === SubmissionStatus.REVIEW
          ? "REVIEW"
          : latest === SubmissionStatus.REJECT
            ? "REJECT"
            : "NONE",
    };
  });

  const totalAssignments = assignments.length;
  const approvedAssignments = approvedIds.size;
  const eligible =
    !isManager &&
    klass.status !== ClassStatus.DRAFT &&
    klass.completedAt !== null &&
    totalAssignments > 0 &&
    approvedAssignments === totalAssignments;

  return {
    kind: "ok",
    eligible,
    classCompleted: klass.completedAt !== null,
    totalAssignments,
    approvedAssignments,
    assignments: mapped,
    hasCertificate: !!certificate,
  };
};

export const generateCertificateService = async (
  classId: string,
  userId: string
) => {
  const eligibility = await getCertificateEligibility(userId, classId);
  if (eligibility.kind === "not-found") {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (eligibility.kind === "forbidden") {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ROLE,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }
  // One undifferentiated message for every graduation failure: the
  // caller must not learn which rule failed.
  if (!eligibility.eligible) {
    return new ErrorApp("Class not completed", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  if (eligibility.hasCertificate) {
    return new ErrorApp(
      "Certificate already generated",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await generateCertificateRepository(userId, classId);
};

export const getCertificateEligibilityService = async (
  classId: string,
  userId: string
): Promise<CertificateEligibilityDTO | ErrorApp> => {
  const eligibility = await getCertificateEligibility(userId, classId);
  if (eligibility.kind === "not-found") {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (eligibility.kind === "forbidden") {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ROLE,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }
  return {
    eligible: eligibility.eligible,
    classCompleted: eligibility.classCompleted,
    totalAssignments: eligibility.totalAssignments,
    approvedAssignments: eligibility.approvedAssignments,
    assignments: eligibility.assignments,
  };
};

export const getCertificatesService = async (
  query: CertificateQuery,
  userId?: string
) => {
  const { page = "1", perPage = "10" } = query;
  const [certificates, totalData] = await Promise.all([
    getCertificatesRepository(query, userId),
    getCertificatesCountRepository(query, userId),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: getCertificatesMapper(certificates),
    meta,
  };
};
