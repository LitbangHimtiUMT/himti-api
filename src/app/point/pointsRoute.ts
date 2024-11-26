import { Router } from "express";
import { getUserPointsController } from "./pointController";

const route = Router();

route.get("/member", getUserPointsController);

export default route;
