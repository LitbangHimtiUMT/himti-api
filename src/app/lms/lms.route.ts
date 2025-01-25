import { Router } from "express";
import { mentorsRoute } from "./mentor/mentor.route";
import { categoriesRoute } from "./categories/categories.route";

export const lmsRoute = Router();

lmsRoute.use("/mentors", mentorsRoute);
lmsRoute.use("/categories", categoriesRoute);
