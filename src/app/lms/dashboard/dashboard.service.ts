import {
  DashboardPerClassDTO,
  DashboardReviewQueueItemDTO,
  DashboardStatsDTO,
} from "./dashboard.dto";
import {
  getDashboardAssignmentsRepository,
  getDashboardCertificatesRepository,
  getDashboardClassesRepository,
  getDashboardCompletedModulesRepository,
  getDashboardModuleCountsRepository,
  getDashboardModulesRepository,
  getDashboardParticipantsRepository,
  getDashboardPendingReviewsRepository,
  getDashboardReviewQueueRepository,
} from "./dashboard.repository";

const emptyStats = (): DashboardStatsDTO => ({
  totals: {
    classes: 0,
    participants: 0,
    pendingReviews: 0,
    certificates: 0,
  },
  perClass: [],
  reviewQueue: [],
});

/**
 * Mentor dashboard aggregates. One class query, then a fixed set of
 * batch queries over the scoped class ids — no query per class.
 * Participants are distinct user ids and progress counts distinct
 * completed modules, because neither table has a unique constraint
 * guarding duplicates at the database layer.
 */
export const getDashboardStatsService = async (
  userId: string
): Promise<DashboardStatsDTO> => {
  const classes = await getDashboardClassesRepository(userId);
  if (classes.length === 0) {
    return emptyStats();
  }

  const classIds = classes.map((klass) => klass.id);
  const [
    participants,
    moduleCounts,
    modules,
    completed,
    assignments,
    pendingReviews,
    certificates,
    queue,
  ] = await Promise.all([
    getDashboardParticipantsRepository(classIds),
    getDashboardModuleCountsRepository(classIds),
    getDashboardModulesRepository(classIds),
    getDashboardCompletedModulesRepository(classIds),
    getDashboardAssignmentsRepository(classIds),
    getDashboardPendingReviewsRepository(classIds),
    getDashboardCertificatesRepository(classIds),
    getDashboardReviewQueueRepository(classIds),
  ]);

  const participantsByClass = new Map<string, Set<string>>();
  const allParticipants = new Set<string>();
  for (const row of participants) {
    let members = participantsByClass.get(row.classId);
    if (!members) {
      members = new Set<string>();
      participantsByClass.set(row.classId, members);
    }
    members.add(row.userId);
    allParticipants.add(row.userId);
  }

  const totalModulesByClass = new Map<string, number>();
  for (const row of moduleCounts) {
    totalModulesByClass.set(
      row.classId,
      (totalModulesByClass.get(row.classId) ?? 0) + row._count.module
    );
  }

  const classIdByModule = new Map<string, string>();
  for (const row of modules) {
    classIdByModule.set(row.id, row.session.classId);
  }

  const completedByClassUser = new Map<string, Set<string>>();
  for (const row of completed) {
    const classId = classIdByModule.get(row.moduleId);
    if (!classId) {
      continue;
    }
    const key = `${classId}:${row.userId}`;
    let done = completedByClassUser.get(key);
    if (!done) {
      done = new Set<string>();
      completedByClassUser.set(key, done);
    }
    done.add(row.moduleId);
  }

  const classIdByAssignment = new Map<string, string>();
  for (const row of assignments) {
    if (!row.module) {
      continue;
    }
    classIdByAssignment.set(row.id, row.module.session.classId);
  }

  const pendingByClass = new Map<string, number>();
  for (const row of pendingReviews) {
    const classId = classIdByAssignment.get(row.assignmentId);
    if (!classId) {
      continue;
    }
    pendingByClass.set(
      classId,
      (pendingByClass.get(classId) ?? 0) + row._count._all
    );
  }

  const certificatesByClass = new Map<string, number>();
  for (const row of certificates) {
    certificatesByClass.set(row.classId, row._count._all);
  }

  const perClass: DashboardPerClassDTO[] = classes.map((klass) => {
    const members = participantsByClass.get(klass.id) ?? new Set<string>();
    const totalModules = totalModulesByClass.get(klass.id) ?? 0;
    let progressSum = 0;
    for (const memberId of members) {
      // Same formula as the enrolled-class card
      // (getClassAccessMapper): completed modules over total modules
      // of the class, 0 when the class has no modules. Completed
      // here is distinct modules, not raw completion rows.
      const done =
        completedByClassUser.get(`${klass.id}:${memberId}`)?.size ?? 0;
      progressSum += totalModules === 0 ? 0 : (done / totalModules) * 100;
    }
    const avgProgress =
      members.size === 0 ? 0 : Number((progressSum / members.size).toFixed(2));
    return {
      id: klass.id,
      name: klass.name,
      status: klass.status,
      participants: members.size,
      pendingReviews: pendingByClass.get(klass.id) ?? 0,
      avgProgress,
    };
  });

  const reviewQueue: DashboardReviewQueueItemDTO[] = [];
  for (const row of queue) {
    // moduleId is a required scalar on the assignment, but the module
    // relation is nullable in the schema; a row without it cannot
    // build a review link, so it is skipped. The foreign key makes
    // this unreachable in practice.
    if (!row.assignment.module) {
      continue;
    }
    reviewQueue.push({
      submissionId: row.id,
      participantName: row.participant.name,
      classId: row.assignment.module.session.classId,
      className: row.assignment.module.session.class.name,
      sessionId: row.assignment.module.session.id,
      moduleId: row.assignment.moduleId,
      assignmentId: row.assignment.id,
      assignmentTitle: row.assignment.title,
      submittedAt: row.createdAt,
    });
  }

  return {
    totals: {
      classes: classes.length,
      participants: allParticipants.size,
      pendingReviews: perClass.reduce(
        (sum, item) => sum + item.pendingReviews,
        0
      ),
      certificates: [...certificatesByClass.values()].reduce(
        (sum, count) => sum + count,
        0
      ),
    },
    perClass,
    reviewQueue,
  };
};
