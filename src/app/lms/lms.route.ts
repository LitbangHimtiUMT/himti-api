import { Router } from "express";
import { mentorsRoute } from "./mentor/mentor.route";

export const lmsRoute = Router()

lmsRoute.use('/mentors', mentorsRoute)