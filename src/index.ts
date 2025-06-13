// import { dbconnect } from 'config'
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import schedule from 'node-schedule'
import { environment } from "./libs";
import routes from "./routes";
import { HandlingError } from "./utils/handling-error";

const app = express();

const port = environment.PORT || 5000;
dotenv.config();
// dbconnect()
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Content-Type",
      "Date",
      "X-Api-Version",
      "X-Api-Key",
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

// schedule.scheduleJob("35 20 * * *", async () => {
//   const fcm = await getUserFCMByNIM("2255201237");
//   for (const item of fcm) {
//     await SendFirebaseNotification(
//       NotificationMessage("ABAIKAN INI", "TESTING", item.fcmToken)
//     );
//   }
//   console.log("running a task every 30 seconds");
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}🚀`);
  schedule.scheduleJob('* * * * *', async () => {
		console.log('log scheduler himti api')
	})
});

export default app;
