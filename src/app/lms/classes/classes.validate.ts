import path from "path";
import { getCategoryById } from "../categories/categories.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { ImageType } from "../../../utils/upload-file-to-storage";
import { getUserById } from "../../authentication/auth.repository";
import { CreateClassBodyRequest } from "./classes.dto";

// Thumbnails are the only file this endpoint accepts. The 2 MB limit
// matches the "Max size: 2MB" label in the LMS upload form; the type
// check matches the image formats the form offers. Both run here so
// create and update share one enforcement point, before sharp/S3/DB.
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024;
const THUMBNAIL_EXTENSIONS = Object.values(ImageType);

export const createClassValidate = async (
  action: "create" | "update",
  {
    categoryId,
    level,
    thumbnail,
  }: Partial<Omit<CreateClassBodyRequest, "session">>,
  userId?: string
) => {
  if (level) {
    if (
      level !== "BEGINNER" &&
      level !== "INTERMEDIATE" &&
      level !== "EXPERT"
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.LEVEL,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  if (categoryId) {
    const getCategory = await getCategoryById(categoryId as string);
    if (!getCategory) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.CATEGORY,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }

  if (action === "create") {
    if (!thumbnail) {
      return new ErrorApp(
        MESSAGES.ERROR.REQUIRED.IMAGE,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  if (thumbnail && typeof thumbnail === "object") {
    const file = thumbnail;
    if (file.size > MAX_THUMBNAIL_SIZE) {
      return new ErrorApp(
        "Thumbnail size must not exceed 2MB",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (!THUMBNAIL_EXTENSIONS.includes(ext) || !ImageType[file.mimetype]) {
      return new ErrorApp(
        "Invalid thumbnail type, allowed types are PNG, JPG, JPEG, and WEBP",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  if (userId) {
    const getUser = await getUserById(userId as string);
    if (!getUser) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }
};
