import {
  createPotentialUser,
  findAllPotentialUsers,
  updatePotentialUser,
} from "./potential-users.repository";
import {
  CreatePotentialUserDTO,
  UpdatePotentialUserDTO,
} from "./potential-users.dto";
import { ImagePath } from "../../utils/image-path";
import {
  BUCKET_FOLDER,
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { findKeyByString, incrementKeyUsage } from "./potential-user-keys.repository";
import { prisma } from "../../config";
import sharp from "sharp";
import { environment } from "../../libs";

export const getAllPotentialUsersService = async () => {
  const users = await findAllPotentialUsers();
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    nim: user.nim,
    photo: user.photo
      ? ImagePath(`${BUCKET_FOLDER.user}/${user.photo}`)
      : null,
    experience: user.potentialUsers,
  }));
};

export const createPotentialUserService = async (
  data: CreatePotentialUserDTO,
  photo?: Express.Multer.File
) => {
  // 1. Verify key exists, is active, and is not expired
  const keyRecord = await findKeyByString(data.keyUsed);
  if (!keyRecord || !keyRecord.isActive) {
    return new ErrorApp("Registration key is invalid or inactive", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  if (keyRecord.expiredAt && new Date(keyRecord.expiredAt) < new Date()) {
    return new ErrorApp("Registration key has expired", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  // 2. Verify usage limit
  if (keyRecord.maxUsage !== null && keyRecord.usedCount >= keyRecord.maxUsage) {
    return new ErrorApp("Registration key usage limit reached", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  // 3. Verify user and active member status
  let userWhere: any = {};
  if (data.userId) {
    userWhere = { id: data.userId };
  } else if (data.nim) {
    userWhere = { nim: data.nim };
  } else if (data.email) {
    userWhere = { email: data.email };
  }

  const user = await prisma.user.findFirst({
    where: userWhere,
    include: {
      Member: {
        include: {
          Generation: true,
        },
      },
    },
  });

  if (!user) {
    return new ErrorApp("User not found", 404, MESSAGE_CODE.NOT_FOUND);
  }

  if (!user.Member || !user.Member.isActive) {
    return new ErrorApp("Only active members can fill out this form", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  // 4. Verify generation year matches allowed generations
  if (keyRecord.allowedGen && keyRecord.allowedGen.length > 0) {
    const memberGenYear = user.Member.Generation?.year;
    if (!memberGenYear || !keyRecord.allowedGen.includes(memberGenYear)) {
      return new ErrorApp(
        `This key is not allowed for your generation (${memberGenYear || "Unknown"})`,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  // 5. If photo is supplied, process, compress and upload it to S3, and update user photo
  if (photo) {
    const photoName = `${photo.originalname.replace(FileType[photo.mimetype], "")}${+new Date()}.webp`;
    const quality = photo.size > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(photo.buffer).webp({ quality }).toBuffer();

    if (user.photo) {
      try {
        await RemoveFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.user}/${user.photo}`
        );
      } catch (err) {
        console.error("Failed to remove old photo:", err);
      }
    }

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.user}/${photoName}`,
      Body: compress,
      ContentType: "image/webp",
    });

    // Update the User record in DB with the new photo file name
    await prisma.user.update({
      where: { id: user.id },
      data: { photo: photoName },
    });
  }

  // 6. Create potential user profile and increment token usage
  const { nim, email, ...cleanedData } = data;
  const finalData = {
    ...cleanedData,
    userId: user.id,
  };
  const result = await createPotentialUser(finalData as any);
  await incrementKeyUsage(data.keyUsed);

  return result;
};

export const updatePotentialUserService = async (
  id: string,
  data: UpdatePotentialUserDTO
) => {
  return await updatePotentialUser(id, data);
};
