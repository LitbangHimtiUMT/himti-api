import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { environment } from "../libs";
import { MESSAGE_CODE } from "./error-code";
import { ErrorApp } from "./http-error";

export interface FileInterface {
  ContentType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ACL: any;
  Bucket: string;
  Key: string;
  Body: Buffer;
}

export const BUCKET_FOLDER = {
  attendance: "attendance",
  event: "event",
  eventRegistration: "event-registration",
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
};

export const FileType: Record<string, string> = {
  "image/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "application/octet-stream": ".jpg",

  // PowerPoint
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/x-iwork-keynote-sffkey": ".key",

  // Word Documents
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/x-iwork-pages-sffpages": ".pages", // optional for Apple Pages
  'application/zip': '.zip',
  "application/vnd.rar": ".rar"
};

export const ImageType: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpeg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
};

export const getFileExtension = (mimeType: string, fileName?: string): string => {
  // Coba dapatkan ekstensi dari mimeType yang diketahui
  const extensionFromMime = FileType[mimeType];
  
  if (extensionFromMime && mimeType !== "application/octet-stream") {
    return extensionFromMime;
  }
  
  // Jika mimeType adalah octet-stream, coba deteksi dari nama file
  if (fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return fileName.substring(lastDotIndex).toLowerCase();
    }
  }
  
  // Fallback default jika tidak bisa dideteksi
  return ".bin"; // atau "" jika ingin tanpa ekstensi
};

export const storage = multer.memoryStorage();

export const MulterFileFilter = (
  request: Request,
  file: Express.Multer.File,
  callBack: FileFilterCallback
): void => {
  console.log("ur file =>", file);
  if (file.mimetype && FileType[file.mimetype]) {
    callBack(null, true);
  } else {
    callBack(null, false);
    callBack(
      new ErrorApp(
        "Tipe file tidak mendukung, tipe file harus berjenis: png, jpg, dan jpeg",
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
  }
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

  try {
    await StorageS3Client.send(command);
    console.log(`File exists: ${key}`);
    return { exists: true, error: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "NotFound") {
      console.log(`File does not exist: ${key}`);
      return { exists: false, error: null };
    }
    console.error(`Error checking file existence: ${error}`);
    return { exists: false, error };
  }
};

export const GetPublicURL = (filename: string): string => {
  return `${environment.STORAGE.ENDPOINT_RESPONSE}/${environment.STORAGE.BUCKET}/${environment.STORAGE.BUCKET_FOLDER}/${filename}`;
};

export const upload = multer({
  storage,
  fileFilter: MulterFileFilter,
});
