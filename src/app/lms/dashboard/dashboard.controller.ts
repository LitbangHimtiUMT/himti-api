import { type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGES } from "../../../utils/messages";
import { getDashboardStatsService } from "./dashboard.service";

export const getDashboardStatsController = async (
  req: RequestWithAccessToken,
  res: Response
) => {
  const { userId } = req;
  const result = await getDashboardStatsService(userId);
  // Single payload, no pagination meta: the review queue cap is a
  // fixed design limit, not a page (see the repository).
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.DASHBOARD.GET,
    result
  );
};
