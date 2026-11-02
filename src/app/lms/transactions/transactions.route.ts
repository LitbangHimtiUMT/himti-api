import { Router } from "express";

export const transactionRoute = Router();

// Midtrans callback is DISABLED in Fase 1: the old handler trusted the
// transaction status from the request body without verifying the
// signature, so anyone could mark a payment SUCCESS. The service code
// is kept (unreachable) until Fase 3 cleanup, but no HTTP route
// accepts callbacks anymore. Re-enable only with signature
// verification, as a deliberate decision.
transactionRoute.post("/callback", (_req, res) => {
  res.status(410).json({
    status: 410,
    message: "Payment callback is disabled",
  });
});
