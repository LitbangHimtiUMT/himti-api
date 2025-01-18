import { Router } from "express";
import { getVersionController, updateVersionController } from "./version.controller";

const route = Router()

route.get('/', getVersionController)
route.put('/:versionId', updateVersionController)

export default route