import sharp from "sharp";
import { environment } from "../../libs";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { ImagePath } from "../../utils/image-path";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import {
  BUCKET_FOLDER,
  FileType,
  ImageType,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import {
  BusinessDTO,
  IFilterBusiness,
  UploadFileBussinessDTO,
} from "./business.dto";
import {
  createBusinessImage,
  createMerchandise,
  getBusinessById,
  getMerchandiseByTitle,
  getMerchandises,
  getMerchandisesCount,
  getServices,
  getServicesCount,
} from "./business.repository";

export const createMerchandiseService = async (data: BusinessDTO) => {
  const { title } = data;
  const getMerch = await getMerchandiseByTitle(title);

  if (getMerch)
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.MERCHANDISE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  const response = await createMerchandise(data);
  return response;
};

export const uploadImageBusinessService = async (
  data: UploadFileBussinessDTO,
  businessId: number
) => {
  const business = await getBusinessById(businessId);

  if (!business) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.BUSINESS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (!ImageType[data.image.mimetype]) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.FILE_TYPE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const quality = data.image.size > 5 * 1024 * 1024 ? 75 : 100;
  const compress = await sharp(data.image.buffer).webp({ quality }).toBuffer();
  const fileName = `${data.image?.originalname.replace(FileType[data.image.mimetype], "")} - ${+new Date()}.webp`;
  await UploadFileToStorage({
    Bucket: environment.STORAGE.BUCKET,
    Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.business.merchandise}/${fileName}`,
    Body: compress,
    ContentType: FileType["image/webp"],
    ACL: "public-read",
  });

  const response = await createBusinessImage(business.id, fileName);
  return response;
};
// export const createServiceService = async (data: BusinessDTO) => {
//   const { title } = data;
//   const getService = await getServiceByTitle(title);

//   if (!data.image)
//     return new ErrorApp(
//       MESSAGES.ERROR.REQUIRED.IMAGE,
//       400,
//       MESSAGE_CODE.BAD_REQUEST
//     );
//   if (getService)
//     return new ErrorApp(
//       MESSAGES.ERROR.ALREADY.MERCHANDISE,
//       400,
//       MESSAGE_CODE.BAD_REQUEST
//     );
//   if ((data?.image?.size as number) > 5242880)
//     return new ErrorApp(
//       MESSAGES.ERROR.INVALID.IMAGE_SIZE,
//       400,
//       MESSAGE_CODE.BAD_REQUEST
//     );

//   const response = await createMerchandise(data);
//   return response;
// };

export const getMerchandiseService = async ({
  page = 1,
  perPage = 10,
  search,
}: IFilterBusiness) => {
  const [merchandise, totalData] = await Promise.all([
    getMerchandises({ page, perPage, search }),
    getMerchandisesCount({ search }),
  ]);
  const meta = Meta(page, perPage, totalData);
  return {
    data: merchandise.map((item) => ({
      ...item,
      businessImage: item.businessImage.map((image) =>
        ImagePath(`${BUCKET_FOLDER.business.merchandise}/${image.image}`)
      ),
    })),
    meta,
  };
};
export const getServiceService = async ({
  page = 1,
  perPage = 10,
  search,
}: IFilterBusiness) => {
  const [service, totalData] = await Promise.all([
    getServices({ page, perPage, search }),
    getServicesCount({ search }),
  ]);
  const meta = Meta(page, perPage, totalData);
  if (!service.length && !meta.totalPages && !meta.totalData) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SERVICE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  return { data: service, meta };
};
