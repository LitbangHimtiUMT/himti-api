import { Router } from "express";
import { VerifyToken } from "middleware/verifyToken";
import { getUserPointsController } from "./pointController";

const route = Router();

route.get("/member", VerifyToken, getUserPointsController);

export default route;
