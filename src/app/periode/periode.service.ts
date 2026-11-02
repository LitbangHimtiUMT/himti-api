import sharp from "sharp";
import {
  createPeriod,
  deactivateAllExcept,
  deletePeriod,
  findAllPeriods,
  findActivePeriod,
  findPeriodById,
  findPeriodByString,
  updatePeriod,
} from "./periode.repository";
import { CreatePeriodeDTO, UpdatePeriodeDTO } from "./periode.dto";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ImagePath } from "../../utils/image-path";
import { environment } from "../../libs";
import {
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";

export const getActivePeriodService = async () => {
  const period = await findActivePeriod();
  if (!period) return null;
  return {
    ...period,
    logo: period.logo ? ImagePath(`periode/${period.logo}`) : null,
  };
};

export const getAllPeriodsService = async () => {
  const periods = await findAllPeriods();
  return periods.map((p) => ({
    ...p,
    logo: p.logo ? ImagePath(`periode/${p.logo}`) : null,
  }));
};

export const createPeriodService = async (
  data: CreatePeriodeDTO,
  logoFile?: Express.Multer.File
) => {
  const existing = await findPeriodByString(data.period);
  if (existing) {
    return new ErrorApp("Period entry already exists", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  let logoName = null;
  if (logoFile) {
    logoName = `${logoFile.originalname.replace(FileType[logoFile.mimetype], "")}-${+new Date()}.webp`;
    const quality = logoFile.size > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(logoFile.buffer).webp({ quality }).toBuffer();

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/periode/${logoName}`,
      Body: compress,
      ContentType: "image/webp",
    });
  }

  const newPeriod = await createPeriod({
    ...data,
    logo: logoName || undefined,
  });

  if (newPeriod.isActive) {
    await deactivateAllExcept(newPeriod.id);
  }

  return newPeriod;
};

export const updatePeriodService = async (
  id: string,
  data: UpdatePeriodeDTO,
  logoFile?: Express.Multer.File
) => {
  const existing = await findPeriodById(id);
  if (!existing) {
    return new ErrorApp("Period not found", 404, MESSAGE_CODE.NOT_FOUND);
  }

  let logoName = existing.logo;
  if (logoFile) {
    logoName = `${logoFile.originalname.replace(FileType[logoFile.mimetype], "")}-${+new Date()}.webp`;
    const quality = logoFile.size > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(logoFile.buffer).webp({ quality }).toBuffer();

    if (existing.logo) {
      try {
        await RemoveFileFromStorage(`${environment.STORAGE.BUCKET_FOLDER}/periode/${existing.logo}`);
      } catch (err) {
        console.error("Failed to remove old logo:", err);
      }
    }

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/periode/${logoName}`,
      Body: compress,
      ContentType: "image/webp",
    });
  }

  const updated = await updatePeriod(id, {
    ...data,
    logo: logoName || undefined,
  });

  if (updated.isActive) {
    await deactivateAllExcept(updated.id);
  }

  return updated;
};

export const deletePeriodService = async (id: string) => {
  const existing = await findPeriodById(id);
  if (!existing) {
    return new ErrorApp("Period not found", 404, MESSAGE_CODE.NOT_FOUND);
  }

  if (existing.logo) {
    try {
      await RemoveFileFromStorage(`${environment.STORAGE.BUCKET_FOLDER}/periode/${existing.logo}`);
    } catch (err) {
      console.error("Failed to remove logo on delete:", err);
    }
  }

  await deletePeriod(id);
  return null;
};
