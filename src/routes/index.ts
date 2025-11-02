import { Router, type Request, type Response } from "express";
import prestasiRoute from "../app/achievements/achievements.route";
import absensiRoute from "../app/attendances/attendances.route";
import registrationTypeRoute from "../app/registration-type/registration-type.routes";
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
import { prisma } from "../config";
import dayjs from "dayjs";
import { ErrorApp } from "../utils/http-error";
import { environment } from "../libs";

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
route.use("/registration-type", registrationTypeRoute);
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
  console.log("himti scheduler...");
  return res.json({ message: "himti scheduler" });
});

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ====== LOKASI (acak ±100 m di sekitar titik acuan) ======
const BASE_LAT = -6.1923564;
const BASE_LNG = 106.6309349;
const RADIUS_METERS = 100;
const ADDRESS_FIXED =
  "Jl. Perintis Kemerdekaan I No.33, Babakan, Kecamatan Tangerang, Kota Tangerang, Banten, 15118, Indonesia";

function makeCoordinateAround() {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((BASE_LAT * Math.PI) / 180);
  const r = Math.random() * RADIUS_METERS;
  const theta = Math.random() * Math.PI * 2;
  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);
  const lat = BASE_LAT + dy / metersPerDegLat;
  const lng = BASE_LNG + dx / metersPerDegLng;
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function makeAttendanceTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Pilih nilai point BARU untuk attendance BARU (penambahan murni),
 * dengan preferensi 700..1000, tetapi:
 * - tidak boleh membuat total > 1500
 * - jika 700..1000 membuat lewat, pilih sehingga total akhir 1300..1500
 * - jika total sudah >=1500 → kembalikan null (jangan create point)
 */
function pickAdditionForCreate(
  currentTotal: number,
  prefMin = 700,
  prefMax = 1000
): number | null {
  const maxAdd = 1500 - currentTotal;
  if (maxAdd <= 0) return null;

  // Normal case: masih muat minimal prefMin
  if (maxAdd >= prefMin) {
    const hi = Math.min(prefMax, maxAdd);
    return randInt(prefMin, hi);
  }

  // Adjust: targetkan total akhir 1300..1500
  const targetMinTotal = Math.max(1300, currentTotal + 1);
  const targetMaxTotal = 1500;
  if (targetMinTotal > targetMaxTotal) return null;
  const targetTotal = randInt(targetMinTotal, targetMaxTotal);
  return targetTotal - currentTotal;
}

/**
 * Pilih nilai point BARU untuk attendance YANG SUDAH ADA point (replace),
 * dihitung terhadap total TANPA point attendance tsb.
 * Preferensi 700..1000, tapi:
 * - final total (totalWithout + newV) tidak boleh > 1500
 * - jika 700..1000 membuat lewat, pilih sehingga total akhir 1300..1500
 * - jika tidak ada ruang, boleh kembalikan 0 (tidak menambah total)
 */
function pickReplacementForUpdate(
  totalWithoutThisAttendance: number,
  prefMin = 700,
  prefMax = 1000
): number {
  const maxNew = 1500 - totalWithoutThisAttendance;
  if (maxNew <= 0) return 0;

  if (maxNew >= prefMin) {
    const hi = Math.min(prefMax, maxNew);
    return randInt(prefMin, hi);
  }

  const targetMinTotal = Math.max(1300, totalWithoutThisAttendance); // bisa sama dengan totalWithout (→ 0..)
  const targetMaxTotal = 1500;
  if (targetMinTotal > targetMaxTotal) return 0;
  const targetTotal = randInt(targetMinTotal, targetMaxTotal);
  const candidate = targetTotal - totalWithoutThisAttendance;
  return Math.max(0, candidate);
}

route.post("/seed-generation-2022", async (req: Request, res: Response) => {
  const {
    meetingId,
    eventMeetingId,
    code = "",
  } = req.body as {
    meetingId?: string;
    eventMeetingId?: string;
    code?: string;
  };

  if (!code || code !== environment.ANGGOTA_CODE) {
    return new ErrorApp("You're not allowed to access", 403, "FORBIDDEN");
  }

  if (!meetingId || !eventMeetingId) {
    return res
      .status(400)
      .json({ message: "meetingId dan eventMeetingId wajib diisi" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Target user: punya Member & Generation 2022
      const users2022 = await tx.user.findMany({
        where: {
          memberId: { not: null },
          Member: {
            Generation: {
              year: {
                in: ["2022", "2023"],
              },
            },
          },
        },
        select: { id: true },
      });
      const userIds = users2022.map((u) => u.id);
      if (userIds.length === 0) {
        return {
          totalTargetUsers: 0,
          createdAttendance: 0,
          createdPointsOnCreate: 0,
          updatedExistingToBounded: 0,
          createdPointsOnExistingBounded: 0,
          skippedExistingTotalPointGT500: 0,
          createdAttendanceNoPointBecauseCap: 0,
        };
      }

      // Ambil attendance existing di event ini
      const existingAtt = await tx.attendance.findMany({
        where: { userId: { in: userIds }, meetingId, eventMeetingId },
        select: { id: true, userId: true },
      });
      const attByUser = new Map(existingAtt.map((a) => [a.userId, a.id]));

      // =========================
      // CABANG A: BELUM ABSEN
      // =========================
      const newUsers = userIds.filter((id) => !attByUser.has(id));
      let createdAttendance = 0;
      let createdPointsOnCreate = 0;
      let createdAttendanceNoPointBecauseCap = 0;

      if (newUsers.length > 0) {
        const dataToCreate = newUsers.map((userId) => ({
          image: `himti.webp`,
          userId,
          meetingId,
          eventMeetingId,
          coordinate: makeCoordinateAround(),
          address: ADDRESS_FIXED,
          attendanceTime: makeAttendanceTime(),
        }));
        await tx.attendance.createMany({
          data: dataToCreate,
          skipDuplicates: true,
        });
        createdAttendance = dataToCreate.length;
      }

      // requery attendance baru untuk dapatkan id-nya (jika ada)
      const createdAttRows = newUsers.length
        ? await tx.attendance.findMany({
            where: { userId: { in: newUsers }, meetingId, eventMeetingId },
            select: { id: true, userId: true },
          })
        : [];

      if (createdAttRows.length > 0) {
        // total poin per user (untuk pengguna baru absen)
        const sumsNew = await tx.point.groupBy({
          by: ["userId"],
          _sum: { point: true },
          where: { userId: { in: newUsers } },
        });
        const sumMapNew = new Map<string, number>(
          sumsNew.map((s) => [s.userId, s._sum.point ?? 0])
        );

        // untuk masing-masing attendance baru, tentukan nilai point yang tidak melanggar batas 1500
        for (const a of createdAttRows) {
          const currentTotal = sumMapNew.get(a.userId) ?? 0;
          const chosen = pickAdditionForCreate(currentTotal, 700, 1000);
          if (chosen == null || chosen <= 0) {
            // tetap create attendance, tapi tanpa point
            createdAttendanceNoPointBecauseCap++;
            continue;
          }
          await tx.point.create({
            data: { point: chosen, userId: a.userId, attendanceId: a.id },
          });
          createdPointsOnCreate++;
          sumMapNew.set(a.userId, currentTotal + chosen);
        }
      }

      // =========================
      // CABANG B: SUDAH ABSEN
      // =========================
      const existingUsers = userIds.filter((id) => attByUser.has(id));
      let updatedExistingToBounded = 0;
      let createdPointsOnExistingBounded = 0;
      let skippedExistingTotalPointGT500 = 0;

      if (existingUsers.length > 0) {
        // Total poin user (SUM semua points)
        const sums = await tx.point.groupBy({
          by: ["userId"],
          _sum: { point: true },
          where: { userId: { in: existingUsers } },
        });
        const sumMap = new Map<string, number>(
          sums.map((s) => [s.userId, s._sum.point ?? 0])
        );

        // B.1: Filter sesuai aturanmu: jika total > 500 → skip
        const processUserIds = existingUsers.filter(
          (id) => (sumMap.get(id) ?? 0) <= 500
        );
        skippedExistingTotalPointGT500 =
          existingUsers.length - processUserIds.length;

        if (processUserIds.length > 0) {
          // Ambil attendance id mereka
          const attIds = processUserIds.map((uid) => attByUser.get(uid)!); // sudah pasti ada
          // Ambil point yang sudah ada di attendance tsb (jika ada)
          const existingPoints = await tx.point.findMany({
            where: { attendanceId: { in: attIds } },
            select: { id: true, attendanceId: true, userId: true, point: true },
          });
          const pointByAttendance = new Map(
            existingPoints.map((p) => [p.attendanceId, p])
          );

          for (const uid of processUserIds) {
            const attendanceId = attByUser.get(uid)!;
            const totalBefore = sumMap.get(uid) ?? 0;
            const existing = pointByAttendance.get(attendanceId);

            if (existing) {
              // replace: hitung total tanpa point attendance ini
              const totalWithout = totalBefore - existing.point;
              const replacement = pickReplacementForUpdate(
                totalWithout,
                700,
                1000
              );
              // replacement bisa 0 kalau sudah mepet batas
              if (replacement !== existing.point) {
                await tx.point.update({
                  where: { id: existing.id },
                  data: { point: replacement },
                });
                updatedExistingToBounded++;
                sumMap.set(uid, totalWithout + replacement);
              }
            } else {
              // belum ada point di attendance ini → treat seperti create
              const chosen = pickAdditionForCreate(totalBefore, 700, 1000);
              if (chosen != null && chosen > 0) {
                await tx.point.create({
                  data: { point: chosen, userId: uid, attendanceId },
                });
                createdPointsOnExistingBounded++;
                sumMap.set(uid, totalBefore + chosen);
              }
              // kalau chosen null/0 → tidak buat point (agar tidak melanggar batas)
            }
          }
        }
      }

      return {
        totalTargetUsers: userIds.length,
        createdAttendance,
        createdAttendanceNoPointBecauseCap,
        createdPointsOnCreate,
        updatedExistingToBounded,
        createdPointsOnExistingBounded,
        skippedExistingTotalPointGT500,
      };
    });

    return res.json({ message: "OK", ...result });
  } catch (err) {
    console.error(err);
    const error = err as ErrorApp;
    return res.status(500).json({
      message: "Terjadi kesalahan saat memproses endpoint",
      error: error?.message || String(err),
    });
  }
});

route.use("*", (req: Request, res: Response) => {
  return res.status(404).json({
    status: 404,
    code: MESSAGE_CODE.NOT_FOUND,
    message: MESSAGES.ERROR.NOT_FOUND.ROUTE,
  });
});

export default route;
