import { Router } from "express";
import { getUserPointsController } from "./point.controller";
import { verifyToken } from "../../middleware/verify-token";

const route = Router();

route.get("/member", verifyToken, getUserPointsController);

export default route;
