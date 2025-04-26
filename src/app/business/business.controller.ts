import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createMerchandiseService,
  getMerchandiseService,
  getServiceService,
  uploadImageBusinessService,
} from "./business.service";
import { uploadImageBusinessSchema } from "./business.request";

export const createMerchandiseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const merchandise = await createMerchandiseService(body);

  if (merchandise instanceof ErrorApp) {
    next(merchandise);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MERCHANDISE);
};

export const uploadImageBusinessController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { params } = req;
  const { businessId } = params;
  const body = {
    image: req.file as Express.Multer.File,
  };
  console.log({ file: req.file, params });

  const validate = uploadImageBusinessSchema.validate(body);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }

  const business = await uploadImageBusinessService(body, Number(businessId));

  if (business instanceof ErrorApp) {
    next(business);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MERCHANDISE);
};
// export const createServiceController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { title, description, price } = req.body;
//   const file = req.file;
//   const service = await createServiceService({
//     title,
//     description,
//     price,
//     image: file as File & Express.Multer.File,
//   });

//   if (service instanceof ErrorApp) {
//     next(service);
//     return;
//   }

//   HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MERCHANDISE);
// };

export const getMerchandiseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search, page, perPage } = req.query;
  const merchandise = await getMerchandiseService({
    search: search as string,
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  if (merchandise instanceof ErrorApp) {
    next(merchandise);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MERCHANDISE.GET,
    merchandise.data,
    merchandise.meta
  );
};
export const getServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search, page, perPage } = req.query;
  const service = await getServiceService({
    search: search as string,
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });

  if (service instanceof ErrorApp) {
    next(service);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SERVICE.GET,
    service.data,
    service.meta
  );
};
