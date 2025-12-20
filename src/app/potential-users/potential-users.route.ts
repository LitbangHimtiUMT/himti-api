import { Router } from "express";
import {
  createPotentialUserController,
  getPotentialUsersController,
  updatePotentialUserController,
} from "./potential-users.controller";
import { CatchWrapper } from "../../utils/catch-wrapper";

const route = Router();

route.get("/", CatchWrapper(getPotentialUsersController));
route.post("/", CatchWrapper(createPotentialUserController));
route.put("/", CatchWrapper(updatePotentialUserController));

export default route;
