import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { evaluateCourseController } from "./course.controller";

export const courseRoute = Router();

courseRoute.post("/evaluate", CatchWrapper(evaluateCourseController));
