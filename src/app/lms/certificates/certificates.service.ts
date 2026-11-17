import { CertificateRole, ClassStatus, SubmissionStatus } from "@prisma/client";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import {
  canManageClass,
  isClassMentor,
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
 * Single graduation check (M30-SPESIAL §1.1 + mentor claim), shared
 * by generate and eligibility.
 *
 * Two paths, mentor FIRST. A caller who is the class creator or a
 * co-mentor (`isClassMentor` — deliberately NOT `canManageClass`,
 * which would also admit pure admins) claims as PEMATERI and needs
 * no assignments: the class must be non-DRAFT, completed, and have
 * at least one session. A caller in both roles — a mentor who also
 * enrolled — takes the mentor path, so their certificate reads
 * PEMATERI. Everyone else falls through to the participant path: a
 * participant graduates iff enrolled, not a class manager, the
 * class is not DRAFT, the mentor marked it completed, the class
 * has at least one assignment, and every assignment has an APPROVE
 * submission from them. Module completion counts are deliberately
 * NOT consulted on either path.
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
  // Mentor branch first: mentor-wins over the participant path
  // below, and mentors need no enrollment row to claim.
  if (await isClassMentor(userId, classId)) {
    const certificate = await getCertificateUser(userId, classId);
    return {
      kind: "ok",
      role: CertificateRole.PEMATERI,
      eligible:
        klass.status !== ClassStatus.DRAFT &&
        klass.completedAt !== null &&
        klass._count.session > 0,
      classCompleted: klass.completedAt !== null,
      totalAssignments: 0,
      approvedAssignments: 0,
      assignments: [],
      hasCertificate: !!certificate,
      certificateCode: certificate?.code ?? null,
    };
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
    role: CertificateRole.PESERTA,
    eligible,
    classCompleted: klass.completedAt !== null,
    totalAssignments,
    approvedAssignments,
    assignments: mapped,
    hasCertificate: !!certificate,
    certificateCode: certificate?.code ?? null,
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

  return await generateCertificateRepository(userId, classId, eligibility.role);
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
    role: eligibility.role,
    eligible: eligibility.eligible,
    classCompleted: eligibility.classCompleted,
    totalAssignments: eligibility.totalAssignments,
    approvedAssignments: eligibility.approvedAssignments,
    assignments: eligibility.assignments,
    hasCertificate: eligibility.hasCertificate,
    certificateCode: eligibility.certificateCode,
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
