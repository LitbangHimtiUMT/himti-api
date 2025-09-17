import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { createTicketSupportController } from "./ticket-support.controller";

export const ticketSupportRoute = Router();

ticketSupportRoute.post("/", CatchWrapper(createTicketSupportController));
