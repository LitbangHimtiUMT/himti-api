import { Router } from "express";
import { initialController } from "./initial.controller";

const route = Router()

route.post("/", initialController)

export default route