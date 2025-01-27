import { Router } from "express";
import { mentorsRoute } from "./mentor/mentor.route";
import { categoriesRoute } from "./categories/categories.route";
import { classRoute } from "./classes/classes.route";

export const lmsRoute = Router();

lmsRoute.use("/mentors", mentorsRoute);
lmsRoute.use("/categories", categoriesRoute);
lmsRoute.use("/class", classRoute);
