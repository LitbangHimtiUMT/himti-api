import { Router } from "express";
import { mentorsRoute } from "./mentor/mentor.route";
import { categoriesRoute } from "./categories/categories.route";
import { classRoute } from "./classes/classes.route";
import { sessionRoute } from "./sessions/sessions.route";
import { mentorTransactionRoute } from "./mentor-transactions/mentor-transactions.route";

export const lmsRoute = Router();

lmsRoute.use("/mentors", mentorsRoute);
lmsRoute.use("/categories", categoriesRoute);
lmsRoute.use("/mentor-transactions", mentorTransactionRoute);
lmsRoute.use("/class", classRoute);
lmsRoute.use("/sessions", sessionRoute);
