import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";

export const getReviewClassRepository = async (classId: string) => {
  return await prisma.class.findUnique({
    where: {
      id: classId,
    },
    select: {
      id: true,
    },
  });
};

// Newest first. createdAt has 1-second resolution, so id desc is the
// deterministic tie-break — otherwise two reviews created in the same
// second could swap pages between requests.
export const getReviewsByClassRepository = async (
  classId: string,
  query: Query
) => {
  return await prisma.review.findMany({
    where: {
      classId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...queryPagination(query),
  });
};

export const getReviewsCountRepository = async (classId: string) => {
  return await prisma.review.count({
    where: {
      classId,
    },
  });
};

export const getReviewAggregateRepository = async (classId: string) => {
  return await prisma.review.aggregate({
    where: {
      classId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });
};

export const getUserReviewRepository = async (
  userId: string,
  classId: string
) => {
  return await prisma.review.findFirst({
    where: {
      userId,
      classId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });
};

export const createReviewRepository = async (
  userId: string,
  classId: string,
  rating: number,
  text: string | null
) => {
  return await prisma.review.create({
    data: {
      userId,
      classId,
      rating,
      text,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
    },
  });
};

// One groupBy for every class on the page — never one query per class.
// Only classes with at least one review appear in the result; callers
// treat a missing class id as "no ratings".
export const getClassRatingsRepository = async (classIds: string[]) => {
  return await prisma.review.groupBy({
    by: ["classId"],
    where: {
      classId: {
        in: classIds,
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });
};
