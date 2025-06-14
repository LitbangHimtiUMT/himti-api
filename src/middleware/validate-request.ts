import { NextFunction, Request, type Response } from "express";
import Joi from "joi";
import { historyErrorSystem } from "../app/history/history.repository";
import { RequestWithAccessToken } from "../interface/Request";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";

export const validateRequest = (
  body: Joi.ObjectSchema,
  file?: Joi.ObjectSchema
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const request = req as RequestWithAccessToken;
    const bv = body.validate(req.body, { abortEarly: false });
    const fv = file
      ? file.validate(req.file, { abortEarly: false })
      : { error: null };

    const errors = [];

    if (fv.error) {
      errors.push(...fv.error.details.map((i) => i.message.replace(/"/g, "")));
    }

    if (bv.error) {
      errors.push(...bv.error.details.map((i) => i.message.replace(/"/g, "")));
    }
    console.log(errors);
    if (errors.length) {
      const isHaveParams = !!Object.keys(req.params).length;
      const isHaveBody = !!Object.keys(req.body).filter(
        (item) => item?.toLowerCase() !== "password"
      ).length;
      const { password, ...rest } = req.body;
      password?.toString();
      const errorTitle = `Error => ${errors?.[0] ?? "Error not expected"} ${isHaveBody ? `, Body => ${JSON.stringify(rest)}` : ""} ${isHaveParams ? `, Params => ${JSON.stringify(req.params)}` : ""}`;

      await historyErrorSystem({
        title: errorTitle,
        createdBy: request?.userId ?? undefined,
        statusCode: `400 - ${MESSAGE_CODE.BAD_REQUEST}`
      });
      return HandleResponse(res, 400, MESSAGE_CODE.BAD_REQUEST, errors?.[0]);
    }

    next();
  };
};
