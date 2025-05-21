import { Router } from "express";
import { mentorsRoute } from "./mentor/mentor.route";
import { categoriesRoute } from "./categories/categories.route";
import { classRoute } from "./classes/classes.route";
import { sessionRoute } from "./sessions/sessions.route";
import { moduleRoute } from "./modules/modules.route";
import { classParticipantRoute } from "./class-participants/class-participants.route";
import { mentorTransactionRoute } from "./mentor-transactions/mentor-transactions.route";
import { transactionRoute } from "./transactions/transactions.route";
import { completedModuleRoute } from "./completed-modules/completed-modules.route";
import { completedClassRoute } from "./completed-classes/completed-classes.route";
import { assignmentRoute } from "./assignment/assignment.route";
import { certificateRoute } from "./certificates/certificates.route";

export const lmsRoute = Router();

lmsRoute.use("/mentors", mentorsRoute);
lmsRoute.use("/categories", categoriesRoute);
lmsRoute.use("/mentor-transactions", mentorTransactionRoute);
lmsRoute.use("/class", classRoute);
lmsRoute.use("/sessions", sessionRoute);
lmsRoute.use("/modules", moduleRoute);
lmsRoute.use("/class-participants", classParticipantRoute);
lmsRoute.use("/transactions", transactionRoute);
lmsRoute.use("/assignments", assignmentRoute);
lmsRoute.use("/completed-modules", completedModuleRoute);
lmsRoute.use("/completed-classes", completedClassRoute);
lmsRoute.use("/certificates", certificateRoute);
