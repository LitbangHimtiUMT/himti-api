import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { verifyToken } from "../../../middleware/verify-token";
import { evaluateCourseController } from "./course.controller";

export const courseRoute = Router();

// Was fully unauthenticated. Fase 1: any authenticated user (the
// LMS participant flow). Fase 2 adds the enrolment check in the
// service (participant of that class only).
courseRoute.post("/evaluate", verifyToken, CatchWrapper(evaluateCourseController));
