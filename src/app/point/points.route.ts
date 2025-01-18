import { Router } from "express";
import { getUserPointsController } from "./point.controller";

const route = Router();

route.get("/member", getUserPointsController);

export default route;
