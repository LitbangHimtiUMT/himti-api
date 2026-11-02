// import { dbconnect } from 'config'
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { environment } from "./libs";
import routes from "./routes";
import { HandlingError } from "./utils/handling-error";

const app = express();

const port = environment.PORT || 5000;
dotenv.config();
// dbconnect()

/**
 * CORS allowlist. The old config was `origin: true` (any origin,
 * with credentials), which defeats the whole point of the auth
 * fixes. The list is the three known clients only. It can be
 * overridden with the CORS_ALLOWED_ORIGINS env var (comma-separated)
 * — that env var MUST be set in production to exactly the three
 * client origins, and it is part of the pre-merge checklist. When it
 * is not set, the built-in defaults below apply (no localhost, so a
 * local dev frontend must set the env var to include its origin).
 */
const defaultOrigins = [
  "https://himtiumt.org",
  "https://www.himtiumt.org",
  "https://cms.himtiumt.org",
  "https://lms.himtiumt.org",
];
const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",")
    : defaultOrigins
)
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin / non-browser requests have no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      // Temporary bridge (2026-11-02): production LMS/web clients still
      // send the legacy x-api-key header. The server ignores its value
      // (auth is JWT-only), but the header name must be allowed here
      // or browsers block those clients at preflight. Remove this line
      // once all clients are redeployed without the legacy header.
      "x-api-key",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Date",
      "X-Api-Version",
      "X-Encrypted-Data",
      "X-Encryption-IV",
    ],
    credentials: true,
    preflightContinue: false,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(routes);
app.use(HandlingError);

app.listen(port, () => {
  console.log(`Server running on port ${port}🚀`);
});

export default app;
