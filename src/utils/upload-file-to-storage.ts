import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { environment } from "../libs";
import { MESSAGE_CODE } from "./error-code";
import { ErrorApp } from "./http-error";

export interface FileInterface {
  ContentType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ACL?: any;
  Bucket: string;
  Key: string;
  Body: Buffer;
}

export const BUCKET_FOLDER = {
  attendance: "attendance",
  event: "event",
  eventRegistration: "event-registration",
  registrationType: "registration-type",
  business: {
    service: "business/service",
    merchandise: "business/merchandise",
  },
  user: "user",
  structural: "struktural",
  class: "class",
  modules: "modules",
  assignments: "assignments",
  submission: "submission",
  ticketSupport: "ticket-supports",
};

export const FileType: Record<string, string> = {
  // Images
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",

  // PDF
  "application/pdf": ".pdf",

  // Word
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",

  // PowerPoint
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",

  // OpenDocument
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/vnd.oasis.opendocument.text": ".odt",

  // Apple
  "application/x-iwork-keynote-sffkey": ".key",
  "application/x-iwork-pages-sffpages": ".pages",

  // ZIP
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "multipart/x-zip": ".zip",

  // RAR
  "application/vnd.rar": ".rar",
  "application/x-rar-compressed": ".rar",

  // Generic Binary
  "application/octet-stream": ".bin",
};

export const ImageType: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
};

export const getFileExtension = (
  mimeType: string,
  fileName?: string
): string => {
  if (fileName) {
    const ext = path.extname(fileName).toLowerCase();
    if (ext) {
      return ext;
    }
  }

  return FileType[mimeType] || ".bin";
};

export const storage = multer.memoryStorage();

export const MulterFileFilter = (
  request: Request,
  file: Express.Multer.File,
  callBack: FileFilterCallback
): void => {
  console.log("========== FILE UPLOAD ==========");
  console.log({
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  const ext = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".odp",
    ".odt",
    ".key",
    ".pages",
    ".zip",
    ".rar",
  ];

  console.log({
    detectedExtension: ext,
    allowed: allowedExtensions.includes(ext),
  });

  if (!allowedExtensions.includes(ext)) {
    return callBack(
      new ErrorApp(
        "Format File is not allowed",
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
  }

  callBack(null, true);
};

export const StorageS3Client = new S3({
  forcePathStyle: true,
  endpoint: `${environment.STORAGE.ENDPOINT}/s3`,
  credentials: {
    accessKeyId: environment.STORAGE.ACCESS_KEY,
    secretAccessKey: environment.STORAGE.SECRET_KEY,
  },
  region: environment.STORAGE.REGION,
});

export const UploadFileToStorage = async (data: FileInterface) => {
  try {
    const file = await StorageS3Client.send(new PutObjectCommand(data));
    const object = `${data.Bucket}/${data.Key}`;
    console.log("success", object, file);
    return {
      file,
      object,
    };
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

export const GetFileSizeFromStorage = async (data: FileInterface) => {
  try {
    const result = await StorageS3Client.send(new HeadObjectCommand(data));
    const sizeInBytes = result.ContentLength ?? 0;

    console.log("File size (bytes):", sizeInBytes);

    return {
      sizeInBytes,
      sizeInKilobytes: sizeInBytes / 1024,
      sizeInMegabytes: sizeInBytes / (1024 * 1024),
    };
  } catch (error) {
    console.error("Failed to get file size:", error);
    throw error;
  }
};

export const RemoveFileFromStorage = async (key: string) => {
  try {
    const file = new DeleteObjectCommand({
      Bucket: environment.STORAGE.BUCKET,
      Key: key,
    });
    const result = await StorageS3Client.send(file);
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const GetFileFromStorage = async (key: string) => {
  const command = new HeadObjectCommand({
    Bucket: environment.STORAGE.BUCKET,
    Key: key,
  });
  console.log({command})

  try {
    const buffer = await StorageS3Client.send(command);
    return { exists: true, error: null,  buffer};
  } catch (error: any) {
    if (error.name === "NotFound") {
      console.log(`File does not exist: ${key}`);
      return { exists: false, error: null };
    }
    console.error(`Error checking file existence: ${error}`);
    return { exists: false, error, buffer: null };
  }
};

export const GetPublicURL = (filename: string): string => {
  return `${environment.STORAGE.ENDPOINT_RESPONSE}/${environment.STORAGE.BUCKET}/${environment.STORAGE.BUCKET_FOLDER}/${filename}`;
};

export const upload = multer({
  storage,
  fileFilter: MulterFileFilter,
});
