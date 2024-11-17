import { Router } from "express";
import { CatchWrapper } from "../../utils/CatchWrapper";
import { deleteFCMUserController, getAllFCMUserController } from "./user-fcmController";

const route = Router()

route.get("/", CatchWrapper(getAllFCMUserController))
route.delete('/:fcmUserId', CatchWrapper(deleteFCMUserController))
export default route
