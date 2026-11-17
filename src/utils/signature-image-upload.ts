import sharp from "sharp";
import { environment } from "../libs";
import { MESSAGE_CODE } from "./error-code";
import { ErrorApp } from "./http-error";
import { UploadFileToStorage } from "./upload-file-to-storage";

// Uploads a signature image and returns the stored filename.
//
// Signatures are stored as PNG, NOT webp like photos: pdf-lib can
// only embed PNG/JPEG, and PNG keeps the transparent background a
// signature scan needs. Re-encoding through sharp also strips any
// non-image payload smuggled in the uploaded bytes, and rejects
// files that are not decodable images at all.
//
// Type/size validation happens before this runs, in the shared
// multer setup (same extension allowlist and 10 MB limit as
// `image`); this helper only converts, stores, and fails loudly
// when storage fails instead of leaving a dangling DB reference.
export const uploadSignatureImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  let png: Buffer;
  try {
    png = await sharp(file.buffer).png().toBuffer();
  } catch {
    throw new ErrorApp(
      "Signature image is not a valid image file",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  // The original name is untrusted input: keep only safe characters
  // so it can never smuggle path separators into the storage key.
  const baseName =
    file.originalname
      .replace(/\.[^.]*$/, "")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "signature";
  const filename = `${baseName} - ${Date.now()}.png`;

  const result = await UploadFileToStorage({
    Bucket: environment.STORAGE.BUCKET,
    Key: `${environment.STORAGE.BUCKET_FOLDER}/${folder}/${filename}`,
    Body: png,
    ContentType: "image/png",
  });
  if (result instanceof Error) {
    throw new ErrorApp(
      "Failed to upload signature image",
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
  return filename;
};
