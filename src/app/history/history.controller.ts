import { NextFunction, Request, Response } from "express";
import { getHistoriesService } from "./history.service";
import { ErrorApp } from "../../utils/http-error";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { MESSAGES } from "../../utils/messages";

export const getHistoriesController = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {query} = req
    const result = await getHistoriesService(query)
    if(result instanceof ErrorApp){
        next(result)
        return
    }
    HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.HISTORY.GET, result?.data, result?.meta)
}