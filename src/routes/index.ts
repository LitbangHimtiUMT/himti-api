import { Router, type Request, type Response } from "express";
import prestasiRoute from "../app/achievements/achievements.route";
import absensiRoute from "../app/attendances/attendances.route";
import registrationTypeRoute from "../app/registration-type/registration-type.routes";
import authRoute from "../app/authentication/auth.route";
import businessRoute from "../app/business/business.route";
import eventMeetingRoute from "../app/event-meeting/event-meeting.route";
import eventRegistrationRoute from "../app/event-registration/event-registration.route";
import acaraRoute from "../app/event/event.route";
import subAcaraRoute from "../app/sub-acara/sub-acara.route";
import angkatanRoute from "../app/generations/generations.route";
import dosenRoute from "../app/lecturers/lecturers.route";
import { lmsRoute } from "../app/lms/lms.route";
import meetingRoute from "../app/meetings/meetings.route";
import anggotaRoute from "../app/members/members.route";
import notificationRoute from "../app/notification/notification.route";
import pointsRoute from "../app/point/points.route";
import profileRoute from "../app/profile/profile.route";
import strukturalRoute from "../app/struktural/struktural.route";
import userFcmRoute from "../app/user-fcm/user-fcm.route";
import userRoute from "../app/user/user.route";
import versionRoute from "../app/version/version.route";
import potentialUsersRoute from "../app/potential-users/potential-users.route";
import potentialUserKeysRoute from "../app/potential-users/potential-user-keys.route";
import prodiStructuralRoute from "../app/prodi-structural/prodi-structural.route";
import periodeRoute from "../app/periode/periode.route";
import contactInfoRoute from "../app/contact-info/contact-info.route";
import { MESSAGE_CODE } from "../utils/error-code";
import { MESSAGES } from "../utils/messages";
import { historyRoute } from "../app/history/history.route";

const route = Router();

route.use("/auth", authRoute);
route.use("/profile", profileRoute);
route.use("/absensi", absensiRoute);
route.use("/angkatan", angkatanRoute);
route.use("/dosen", dosenRoute);
route.use("/struktural", strukturalRoute);
route.use("/anggota", anggotaRoute);
route.use("/histories", historyRoute);
route.use("/acara", acaraRoute);
route.use("/sub-acara", subAcaraRoute);
route.use("/event-meeting", eventMeetingRoute);
route.use("/event-registration", eventRegistrationRoute);
route.use("/registration-type", registrationTypeRoute);
route.use("/meeting", meetingRoute);
route.use("/points", pointsRoute);
route.use("/business", businessRoute);
route.use("/prestasi", prestasiRoute);
route.use("/user", userRoute);
route.use("/notification", notificationRoute);
route.use("/user-fcm", userFcmRoute);
route.use("/lms", lmsRoute);
route.use("/version", versionRoute);
route.use("/potential-users", potentialUsersRoute);
route.use("/potential-user-keys", potentialUserKeysRoute);
route.use("/prodi-structural", prodiStructuralRoute);
route.use("/periode", periodeRoute);
route.use("/contact-info", contactInfoRoute);


route.get("/", async (req: Request, res: Response) => {
  return res.json({ message: "Hello World 🚀" });
});

route.get("/scheduler", async (req: Request, res: Response) => {
  console.log("himti scheduler...");
  return res.json({ message: "himti scheduler" });
});

route.use("*", (req: Request, res: Response) => {
  return res.status(404).json({
    status: 404,
    code: MESSAGE_CODE.NOT_FOUND,
    message: MESSAGES.ERROR.NOT_FOUND.ROUTE,
  });
});

export default route;
