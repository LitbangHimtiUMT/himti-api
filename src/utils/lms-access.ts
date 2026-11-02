import { prisma } from "../config";
import { MESSAGE_CODE } from "./error-code";
import { ErrorApp } from "./http-error";
import { MESSAGES } from "./messages";

/**
 * LMS ownership checks (Fase 2 IDOR).
 *
 * Rules, applied in services (not just routes, because a route-level
 * role like "MENTOR" says nothing about WHICH class):
 * - Admins (ADMIN / SUPER_ADMIN) may access any class. They are
 *   staff, and the route gates already restrict admin actions to
 *   those roles.
 * - A mentor may access a class only if they created it or are
 *   listed as a mentor of it.
 * - A participant may access a class only if they are enrolled in
 *   it (ClassParticipant row).
 * - Everyone else gets 403, never a 404-vs-403 leak distinction:
 *   for read endpoints the caller simply is not a member of that
 *   class, so 403 is the honest answer.
 *
 * Return value: null when allowed, an ErrorApp when denied, so
 * services can `const denied = await ...; if (denied) return denied;`
 * without throwing through CatchWrapper.
 */
export const isAdminRole = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
};

export const isClassMentor = async (
  userId: string,
  classId: string
): Promise<boolean> => {
  const klass = await prisma.class.findUnique({
    where: { id: classId },
    select: { createdBy: true },
  });
  if (!klass) return false;
  if (klass.createdBy === userId) return true;
  const mentor = await prisma.classMentor.findFirst({
    where: { userId, classId },
    select: { id: true },
  });
  return !!mentor;
};

export const isClassParticipant = async (
  userId: string,
  classId: string
): Promise<boolean> => {
  const row = await prisma.classParticipant.findFirst({
    where: { userId, classId },
    select: { id: true },
  });
  return !!row;
};

/** Participant, mentor, creator, or admin of this class. */
export const canAccessClass = async (
  userId: string,
  classId: string
): Promise<boolean> => {
  if (await isAdminRole(userId)) return true;
  if (await isClassMentor(userId, classId)) return true;
  return isClassParticipant(userId, classId);
};

/** Mentor/creator or admin of this class. Participants do NOT pass. */
export const canManageClass = async (
  userId: string,
  classId: string
): Promise<boolean> => {
  if (await isAdminRole(userId)) return true;
  return isClassMentor(userId, classId);
};

export const requireClassAccess = async (
  userId: string,
  classId: string
): Promise<ErrorApp | null> => {
  if (!classId) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (await canAccessClass(userId, classId)) return null;
  return new ErrorApp(
    MESSAGES.ERROR.FORBIDDEN.ROLE,
    403,
    MESSAGE_CODE.FORBIDDEN
  );
};

export const requireClassManage = async (
  userId: string,
  classId: string
): Promise<ErrorApp | null> => {
  if (!classId) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (await canManageClass(userId, classId)) return null;
  return new ErrorApp(
    MESSAGES.ERROR.FORBIDDEN.ROLE,
    403,
    MESSAGE_CODE.FORBIDDEN
  );
};

export const classIdFromSession = async (
  sessionId: string
): Promise<string | null> => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { classId: true },
  });
  return session?.classId ?? null;
};

export const classIdFromModule = async (
  moduleId: string
): Promise<string | null> => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { session: { select: { classId: true } } },
  });
  return module?.session?.classId ?? null;
};

export const classIdFromAssignment = async (
  assignmentId: string
): Promise<string | null> => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { module: { select: { session: { select: { classId: true } } } } },
  });
  return assignment?.module?.session?.classId ?? null;
};

export const classIdFromSubmission = async (
  submissionId: string
): Promise<string | null> => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      assignment: {
        select: { module: { select: { session: { select: { classId: true } } } } },
      },
    },
  });
  return submission?.assignment?.module?.session?.classId ?? null;
};
