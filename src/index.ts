// import { dbconnect } from 'config'
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { environment } from "./libs";
import routes from "./routes";
import { MESSAGE_CODE } from "./utils/error-code";
import { HandleResponse } from "./utils/handle-response";
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

/**
 * Never let a shared cache store API responses. Vercel's edge cache kept
 * serving a stale Access-Control-Allow-Origin after the apex migration
 * (2026-11-07), so every response carries `private, no-store`. Placed
 * before cors so preflight responses are covered too.
 */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

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

/**
 * A disallowed origin is a client error, not a server error. Answer 403
 * here instead of letting it fall through to the generic error handler,
 * which would log it as a 500 system error (DB write) for what is really
 * a rejected client.
 */
const corsRejectionHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err?.message === "Origin not allowed by CORS") {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      "Origin not allowed by CORS"
    );
  }
  return next(err);
};
app.use(corsRejectionHandler);

app.use(cookieParser());
app.use(express.json());
app.use(routes);
app.use(HandlingError);

app.listen(port, () => {
  console.log(`Server running on port ${port}🚀`);
});

export default app;
