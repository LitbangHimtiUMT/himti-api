import moment from "moment";
import { prisma } from "../../../config";
import { CertificateQuery } from "./certificates.interface";
import { queryPagination } from "../../../utils/pagination";

export const getLastCertificate = async (
  month: string | number,
  year: string | number
) => {
  return await prisma.certificate.findFirst({
    where: {
      code: {
        startsWith: `CERT-HIMTI-${year}-${month}`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const generateCertificateRepository = async (
  userId: string,
  classId: string
) => {
  const now = moment();

  const year = now.format("YYYY"); // e.g. "2025"
  const month = now.format("MM"); // e.g. "05"

  const codePrefix = `${year}-${month}`; // For display in code

  const lastCertificate = await getLastCertificate(month, year);

  let nextNumber = 1;
  if (lastCertificate?.code) {
    const parts = lastCertificate.code.split("-");
    const lastRunning = parseInt(parts[4], 10);
    console.log({ lastRunning, parts });
    if (!isNaN(lastRunning)) {
      nextNumber = lastRunning + 1;
    }
  }

  console.log({ nextNumber, lastCertificate, month, year });

  const code = `CERT-HIMTI-${codePrefix}-${String(nextNumber).padStart(4, "0")}`;

  return await prisma.certificate.create({
    data: {
      userId,
      classId,
      code,
    },
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