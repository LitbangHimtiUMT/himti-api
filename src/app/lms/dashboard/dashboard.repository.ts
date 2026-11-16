import { SubmissionStatus } from "@prisma/client";
import { prisma } from "../../../config";

// The review queue is not paginated: the dashboard shows only the 10
// oldest waiting submissions by design. This cap is a product choice,
// not a page size, so the endpoint carries no pagination meta.
const REVIEW_QUEUE_LIMIT = 10;

/**
 * Classes the caller teaches: created by them, or listed as a mentor
 * of the class. The participant branch of the class-list scoping is
 * deliberately NOT here — a class the mentor only joined as a
 * participant is not a class they teach. DRAFT classes are included,
 * matching the mentor's class table in the LMS.
 */
export const getDashboardClassesRepository = async (userId: string) => {
  return await prisma.class.findMany({
    where: {
      OR: [
        {
          createdBy: userId,
        },
        {
          ClassMentor: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      status: true,
      completedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

/**
 * Distinct (class, participant) pairs. ClassParticipant has no unique
 * constraint on (userId, classId) — duplicates are only guarded at
 * the application layer — so participants are counted from grouped
 * pairs, never from raw rows.
 */
export const getDashboardParticipantsRepository = async (
  classIds: string[]
) => {
  return await prisma.classParticipant.groupBy({
    by: ["classId", "userId"],
    where: {
      classId: {
        in: classIds,
      },
    },
  });
};

export const getDashboardModuleCountsRepository = async (
  classIds: string[]
) => {
  return await prisma.session.findMany({
    where: {
      classId: {
        in: classIds,
      },
    },
    select: {
      classId: true,
      _count: {
        select: {
          module: true,
        },
      },
    },
  });
};

export const getDashboardModulesRepository = async (classIds: string[]) => {
  return await prisma.module.findMany({
    where: {
      session: {
        classId: {
          in: classIds,
        },
      },
    },
    select: {
      id: true,
      session: {
        select: {
          classId: true,
        },
      },
    },
  });
};

/**
 * Distinct (module, user) completions. CompletedModule has no unique
 * constraint on (moduleId, userId), so progress counts distinct
 * modules per participant, never raw completion rows.
 */
export const getDashboardCompletedModulesRepository = async (
  classIds: string[]
) => {
  return await prisma.completedModule.groupBy({
    by: ["moduleId", "userId"],
    where: {
      module: {
        session: {
          classId: {
            in: classIds,
          },
        },
      },
    },
  });
};

export const getDashboardAssignmentsRepository = async (
  classIds: string[]
) => {
  return await prisma.assignment.findMany({
    where: {
      module: {
        session: {
          classId: {
            in: classIds,
          },
        },
      },
    },
    select: {
      id: true,
      module: {
        select: {
          session: {
            select: {
              classId: true,
            },
          },
        },
      },
    },
  });
};

/**
 * REVIEW rows per assignment, counted as-is: submit blocks a second
 * REVIEW row per (user, assignment) and APPROVE is terminal, so one
 * row is exactly one waiting review. No dedup.
 */
export const getDashboardPendingReviewsRepository = async (
  classIds: string[]
) => {
  return await prisma.submission.groupBy({
    by: ["assignmentId"],
    where: {
      status: SubmissionStatus.REVIEW,
      assignment: {
        module: {
          session: {
            classId: {
              in: classIds,
            },
          },
        },
      },
    },
    _count: {
      _all: true,
    },
  });
};

/**
 * Certificate rows per class. Counted as rows, consistent with the
 * existing certificate claim (generate checks for an existing
 * certificate at the application layer; there is no unique
 * constraint on (classId, userId)).
 */
export const getDashboardCertificatesRepository = async (
  classIds: string[]
) => {
  return await prisma.certificate.groupBy({
    by: ["classId"],
    where: {
      classId: {
        in: classIds,
      },
    },
    _count: {
      _all: true,
    },
  });
};

export const getDashboardReviewQueueRepository = async (
  classIds: string[]
) => {
  return await prisma.submission.findMany({
    where: {
      status: SubmissionStatus.REVIEW,
      assignment: {
        module: {
          session: {
            classId: {
              in: classIds,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: REVIEW_QUEUE_LIMIT,
    select: {
      id: true,
      createdAt: true,
      participant: {
        select: {
          name: true,
        },
      },
      assignment: {
        select: {
          id: true,
          title: true,
          moduleId: true,
          module: {
            select: {
              session: {
                select: {
                  id: true,
                  classId: true,
                  class: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};
