import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { getPrestasiController } from "./achievements.controller";

const route = Router();

route.get("/", CatchWrapper(getPrestasiController));

export default route;
