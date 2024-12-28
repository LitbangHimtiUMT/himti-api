import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { getPrestasiController } from "./achievementsController";

const route = Router();

route.get("/", CatchWrapper(getPrestasiController));

export default route;
