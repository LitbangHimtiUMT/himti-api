import { Prisma } from "@prisma/client";
import { Query } from "../../../interface/Query";
import { MetaResponse } from "../../../interface/ResponseInterface";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { canManageClass } from "../../../utils/lms-access";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { stripAllHtmlTags } from "../../../utils/sanitize-html";
import { getCertificateUser } from "../certificates/certificates.repository";
import {
  ClassReviewsDTO,
  CreateReviewBodyRequest,
  ReviewDTO,
} from "./reviews.dto";
import { getReviewMapper, getReviewsMapper } from "./reviews.mapper";
import {
  createReviewRepository,
  getReviewAggregateRepository,
  getReviewClassRepository,
  getReviewsByClassRepository,
  getReviewsCountRepository,
  getUserReviewRepository,
} from "./reviews.repository";

export const getClassReviewsService = async (
  classId: string,
  query: Query,
  userId?: string
): Promise<{ data: ClassReviewsDTO; meta: MetaResponse } | ErrorApp> => {
  const klass = await getReviewClassRepository(classId);
  if (!klass) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const { page = "1", perPage = "10" } = query;
  const [reviews, totalData, aggregate] = await Promise.all([
    getReviewsByClassRepository(classId, query),
    getReviewsCountRepository(classId),
    getReviewAggregateRepository(classId),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  // Prisma returns null for _avg over zero rows, so an unrated class
  // honestly reports average null instead of a fabricated 0. Two
  // decimals, matching the dashboard's avgProgress precision.
  const aggregateResult = {
    average:
      aggregate._avg.rating === null
        ? null
        : Number(aggregate._avg.rating.toFixed(2)),
    count: aggregate._count._all,
  };

  // Guests get no personal state: canReview/myReview are only computed
  // for a verified token identity, never from a client-supplied id.
  if (!userId) {
    return {
      data: {
        reviews: getReviewsMapper(reviews),
        aggregate: aggregateResult,
        canReview: false,
        myReview: null,
      },
      meta,
    };
  }

  const [myReview, certificate, isManager] = await Promise.all([
    getUserReviewRepository(userId, classId),
    getCertificateUser(userId, classId),
    canManageClass(userId, classId),
  ]);

  return {
    data: {
      reviews: getReviewsMapper(reviews),
      aggregate: aggregateResult,
      canReview: !!certificate && !isManager && !myReview,
      myReview: myReview ? getReviewMapper(myReview) : null,
    },
    meta,
  };
};

export const createReviewService = async (
  body: CreateReviewBodyRequest,
  userId: string
): Promise<ReviewDTO | ErrorApp> => {
  const { classId, rating } = body;

  // Check order is fixed: class exists (404) -> certificate (403) ->
  // not a manager (403) -> no existing review (400).
  const klass = await getReviewClassRepository(classId);
  if (!klass) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const certificate = await getCertificateUser(userId, classId);
  if (!certificate) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.REVIEW_NO_CERTIFICATE,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  if (await canManageClass(userId, classId)) {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.REVIEW_MANAGER,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }

  const existing = await getUserReviewRepository(userId, classId);
  if (existing) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.REVIEW,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  // Plain text only: trim, strip every HTML tag on the server, trim
  // again (stripping can leave bare whitespace), and store null when
  // nothing remains. The Joi max(1000) ran on the raw input; stripping
  // can only shorten it, so the stored text never exceeds the limit.
  const stripped = stripAllHtmlTags((body.text ?? "").trim()).trim();
  const text = stripped === "" ? null : stripped;

  try {
    const created = await createReviewRepository(userId, classId, rating, text);
    return getReviewMapper(created);
  } catch (error) {
    // Race between the duplicate check above and the insert: the
    // unique (userId, classId) constraint is the final guard, and a
    // conflict is the same 400 the check would have returned.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.ALREADY.REVIEW,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    throw error;
  }
};
