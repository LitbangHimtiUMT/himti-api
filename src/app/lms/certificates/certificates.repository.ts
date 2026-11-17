import moment from "moment";
import { CertificateRole, Prisma } from "@prisma/client";
import { prisma } from "../../../config";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { CertificateQuery } from "./certificates.interface";
import { queryPagination } from "../../../utils/pagination";
import {
  buildFormalNumber,
  resolveActiveSigners,
} from "./certificate-signers";

// The single global counter row (id = 1). The formal-number
// sequence never resets; the migration seeds lastNumber = 30.
const GLOBAL_COUNTER_ID = 1;
// First number if the seed row was never applied: seed (30) + 1.
// Only reachable when the migration seed did not run.
const FIRST_FORMAL_NUMBER = 31;

export const generateCertificateRepository = async (
  userId: string,
  classId: string,
  role: CertificateRole
) => {
  return await prisma.$transaction(async (tx) => {
    // A missing signer ROW blocks the claim: the admin must
    // complete the signer data in the CMS first. A missing
    // signature IMAGE does not block — it snapshots as null and
    // the PDF renders the signature zone empty.
    const signers = await resolveActiveSigners(tx);
    if (!signers) {
      throw new ErrorApp(
        "data penandatangan belum lengkap di CMS",
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }

    // Atomic upsert+increment on the single global row: concurrent
    // claims serialize on the row lock, so no number is ever
    // issued twice.
    const counter = await tx.certificateCounter.upsert({
      where: { id: GLOBAL_COUNTER_ID },
      update: { lastNumber: { increment: 1 } },
      create: { id: GLOBAL_COUNTER_ID, lastNumber: FIRST_FORMAL_NUMBER },
    });

    // One-shot hardening: the service-level duplicate check is only
    // a fast path — two concurrent claims can both pass it before
    // either commits, and there is no unique (userId, classId)
    // constraint to catch the second. This second check runs INSIDE
    // the transaction, after the counter upsert serializes
    // concurrent claims on the row lock, so it sees the rival
    // claim's committed row. It must use the tx client, not the
    // module-level getCertificateUser, or it would read outside
    // the transaction. Throwing rolls the counter increment back,
    // so a rejected duplicate never burns a formal number.
    const existing = await tx.certificate.findFirst({
      where: {
        userId,
        classId,
      },
    });
    if (existing) {
      throw new ErrorApp(
        "Certificate already generated",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    const now = moment();
    const year = now.format("YYYY"); // e.g. "2025"
    const month = now.format("MM"); // e.g. "05"

    const lastCertificate = await tx.certificate.findFirst({
      where: {
        code: {
          startsWith: `CERT-HIMTI-${year}-${month}`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextNumber = 1;
    if (lastCertificate?.code) {
      const parts = lastCertificate.code.split("-");
      const lastRunning = parseInt(parts[4], 10);
      if (!isNaN(lastRunning)) {
        nextNumber = lastRunning + 1;
      }
    }

    const code = `CERT-HIMTI-${year}-${month}-${String(nextNumber).padStart(4, "0")}`;
    const formalNumber = buildFormalNumber(counter.lastNumber, now.toDate());

    return await tx.certificate.create({
      data: {
        userId,
        classId,
        code,
        role,
        formalNumber,
        signers: signers as unknown as Prisma.InputJsonValue,
      },
    });
  });
};

export const getCertificateUser = async (userId: string, classId: string) => {
  return await prisma.certificate.findFirst({
    where: {
      classId,
      userId,
    },
  });
};

export const getCertificatesCountByClassRepository = async (
  classId: string
) => {
  return await prisma.certificate.count({
    where: {
      classId,
    },
  });
};

export const getClassForEligibilityRepository = async (classId: string) => {
  return await prisma.class.findUnique({
    where: {
      id: classId,
    },
    select: {
      id: true,
      status: true,
      completedAt: true,
      // The mentor path requires at least one session; the count
      // rides along with the class row instead of a second query.
      _count: {
        select: {
          session: true,
        },
      },
    },
  });
};

export const getClassAssignmentsRepository = async (classId: string) => {
  return await prisma.assignment.findMany({
    where: {
      module: {
        session: {
          classId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      moduleId: true,
      module: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
};

// Latest first: createdAt desc, id desc as the deterministic
// tie-break (createdAt has 1-second resolution, so rows created in
// the same second need a stable order). Callers take the first row
// per assignmentId as the latest submission.
export const getUserSubmissionsByAssignmentsRepository = async (
  userId: string,
  assignmentIds: string[]
) => {
  return await prisma.submission.findMany({
    where: {
      userId,
      assignmentId: {
        in: assignmentIds,
      },
    },
    select: {
      id: true,
      assignmentId: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
};

export const getCertificatesRepository = async(query: CertificateQuery, userId?: string) => {
  const {search, classId} = query
  return prisma.certificate.findMany({
    where: {
      ...classId && {
        classId
      },
      ...userId && {
        userId
      },
      ...search && {
        OR: [
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              }
            },
          },
          {
            code: {
              contains: search,
              mode: "insensitive",
            }
          }
        ]
      }
    },
    include: {
      class: {
        include: {
          category: true,
        }
      },
    },
    ...queryPagination(query)
  })
}

export const getCertificatesCountRepository = async(query: CertificateQuery, userId?: string) => {
  const {search, classId} = query
  return prisma.certificate.count({
    where: {
      ...classId && {
        classId
      },
      ...userId && {
        userId
      },
      ...search && {
        OR: [
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              }
            },
          },
          {
            code: {
              contains: search,
              mode: "insensitive",
            }
          }
        ]
      }
    },
  })
}