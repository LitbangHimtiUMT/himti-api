import { Router, type Request, type Response } from "express";
import prestasiRoute from "../app/achievements/achievements.route";
import absensiRoute from "../app/attendances/attendances.route";
import authRoute from "../app/authentication/auth.route";
import businessRoute from "../app/business/business.route";
import eventMeetingRoute from "../app/event-meeting/event-meeting.route";
import eventRegistrationRoute from "../app/event-registration/event-registration.route";
import acaraRoute from "../app/event/event.route";
import angkatanRoute from "../app/generations/generations.route";
import initialRoute from "../app/initial/initial.route";
import dosenRoute from "../app/lecturers/lecturers.route";
import { lmsRoute } from "../app/lms/lms.route";
import meetingRoute from "../app/meetings/meetings.route";
import anggotaRoute from "../app/members/members.route";
import notificationRoute from "../app/notification/notification.route";
import pointsRoute from "../app/point/points.route";
import profileRoute from "../app/profile/profile.route";
import { schedulingNotification } from "../app/scheduling/scheduling-meeting";
import strukturalRoute from "../app/struktural/struktural.route";
import userFcmRoute from "../app/user-fcm/user-fcm.route";
import userRoute from "../app/user/user.route";
import versionRoute from "../app/version/version.route";
import { MESSAGE_CODE } from "../utils/error-code";
import { MESSAGES } from "../utils/messages";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import PDFDocument from "pdfkit";
import { Stream } from "stream";
import archiver from "archiver";
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
route.use("/event-meeting", eventMeetingRoute);
route.use("/event-registration", eventRegistrationRoute);
route.use("/meeting", meetingRoute);
route.use("/points", pointsRoute);
route.use("/business", businessRoute);
route.use("/prestasi", prestasiRoute);
route.use("/user", userRoute);
route.use("/notification", notificationRoute);
route.use("/user-fcm", userFcmRoute);
route.use("/lms", lmsRoute);
route.use("/initial", initialRoute);
route.use("/version", versionRoute);

route.use("/scheduling-notification-meeting", schedulingNotification);

const names: string[] = [];

route.get("/generate", async (req: Request, res: Response) => {
  const templatePath = path.join(
    __dirname,
    "../../public/certificate-seminar.png"
  );

  // Persiapkan ZIP archive
  const archive = archiver("zip", { zlib: { level: 9 } });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="certificates.zip"'
  );
  archive.pipe(res);

  // const template = await loadImage(templatePath);

  for (const name of names) {
    const template = await loadImage(templatePath);
    const canvas = createCanvas(3508, 2480);
    const ctx = canvas.getContext("2d");

    // Gambar background
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // Atur font
    ctx.font = "bold 180px Times New Roman";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2.5);

    // Buat PDF dari canvas
    const bufferStream = new Stream.PassThrough();
    const doc = new PDFDocument({
      size: [canvas.width, canvas.height],
      margin: 0,
    });
    doc.pipe(bufferStream);

    const imageData = canvas.toBuffer("image/png");
    doc.image(imageData, 0, 0, { width: canvas.width, height: canvas.height });
    doc.end();

    // const pdfBuffer = await new Promise<Buffer>((resolve) => {
    //   const chunks: any[] = [];
    //   bufferStream.on("data", (chunk) => chunks.push(chunk));
    //   bufferStream.on("end", () => resolve(Buffer.concat(chunks)));
    //   doc.pipe(bufferStream); // ❌ Ini menyebabkan duplikasi stream pipe
    // });

    // // Tambahkan ke ZIP
    // archive.append(pdfBuffer, { name: `${name.replace(/ /g, "_")}.pdf` });

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: [canvas.width, canvas.height],
        margin: 0,
      });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.on("end", () => resolve(Buffer.concat(chunks as any)));

      const imageData = canvas.toBuffer("image/png");
      doc.image(imageData, 0, 0, {
        width: canvas.width,
        height: canvas.height,
      });
      doc.end();
    });

    archive.append(pdfBuffer, { name: `${name.replace(/ /g, "_")}.pdf` });
  }

  // Finalisasi ZIP
  archive.finalize();
});

route.get("/", async (req: Request, res: Response) => {
  return res.json({ message: "Hello World 🚀" });
});

route.get("/scheduler", async (req: Request, res: Response) => {
  console.log('himti scheduler...')
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
