import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { getClassById } from "../classes/classes.repository";
import { CertificateQuery } from "./certificates.interface";
import { getCertificatesMapper } from "./certificates.mapper";
import {
  generateCertificateRepository,
  getCertificatesCountRepository,
  getCertificatesRepository,
  getCertificateUser,
} from "./certificates.repository";

export const generateCertificateService = async (
  classId: string,
  userId: string
) => {
  const classess = await getClassById(classId, userId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const total = {
    module: 0,
    completed: 0,
  };
  for (const modules of classess.session) {
    total.module += modules.module.length;
    for (const completed of modules.module) {
      total.completed += completed._count?.completedModule ?? 0;
    }
  }
  const percent = (total.completed / total.module) * 100;
  if (percent < 100) {
    return new ErrorApp("Class not completed", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  const certificate = await getCertificateUser(userId, classId);
  if (certificate) {
    return new ErrorApp(
      "Certificate already generated",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await generateCertificateRepository(userId, classId);
};

export const getCertificatesService = async (
  query: CertificateQuery,
  userId?: string
) => {
  const { page = "1", perPage = "10" } = query;
  const [certificates, totalData] = await Promise.all([
    getCertificatesRepository(query, userId),
    getCertificatesCountRepository(query, userId),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: getCertificatesMapper(certificates),
    meta,
  };
};

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  issuerName?: string;
  additionalText?: string;
}

export async function generateCertificateBuffer(
  data: CertificateData
) {
  // 1. Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // 2. Add a new page
  const page = pdfDoc.addPage([600, 400]);

  // 3. Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 4. Draw certificate design
  // Background rectangle
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 560,
    height: 360,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 2,
  });

  // Header
  page.drawText("CERTIFICATE OF COMPLETION", {
    x: 150,
    y: 350,
    size: 24,
    font,
    color: rgb(0, 0.4, 0.6),
  });

  // Divider line
  page.drawLine({
    start: { x: 100, y: 330 },
    end: { x: 500, y: 330 },
    thickness: 1,
    color: rgb(0, 0.4, 0.6),
  });

  // Main content
  page.drawText("This is to certify that", {
    x: 200,
    y: 300,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  // Student name
  page.drawText(data.studentName, {
    x: 300 - (data.studentName.length * 10) / 2,
    y: 260,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  // Course text
  page.drawText("has successfully completed the course", {
    x: 150,
    y: 230,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  // Course name
  page.drawText(data.courseName, {
    x: 300 - (data.courseName.length * 10) / 2,
    y: 200,
    size: 18,
    font,
    color: rgb(0, 0.4, 0.6),
  });

  // Completion date
  page.drawText(`Completed on: ${data.completionDate}`, {
    x: 200,
    y: 170,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  // Issuer (optional)
  if (data.issuerName) {
    page.drawText(`Issued by: ${data.issuerName}`, {
      x: 200,
      y: 140,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
  }

  // Certificate ID
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 200,
    y: 110,
    size: 10,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Additional text (optional)
  if (data.additionalText) {
    page.drawText(data.additionalText, {
      x: 50,
      y: 80,
      size: 10,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: 500,
    });
  }

  // 5. Get PDF bytes
  return await pdfDoc.save();
}


// interface CertificateAdvanceData {
//   studentName: string; // Akan ditampilkan besar di tengah
//   courseName: string; // Akan diganti jadi semacam penghargaan: "Employee of the Month"
//   completionDate: string; // Tidak ditampilkan di versi ini
//   certificateId: string; // Boleh kecil di bawah
//   issuerName?: string; // Akan digunakan di tanda tangan kiri
//   additionalText?: string; // Akan digunakan di bawah nama
// }

export async function generateCertificateAdvancedBuffer(data: CertificateData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // 🎨 Background biru sebagai bingkai luar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    color: rgb(0.2, 0.4, 0.8), // Biru navy-ish
  });

  // 🎨 Rectangle putih di dalam sebagai konten sertifikat
  page.drawRectangle({
    x: 40,
    y: 40,
    width: 720,
    height: 520,
    color: rgb(1, 1, 1), // Putih
  });

  // Judul utama
  page.drawText("CERTIFICATE", {
    x: 310,
    y: 510,
    size: 28,
    font: titleFont,
    color: rgb(0, 0.2, 0.4),
  });

  // Subjudul
  page.drawText(data.courseName || "Employee of the Month", {
    x: 280,
    y: 480,
    size: 16,
    font: regularFont,
    color: rgb(0, 0.2, 0.4),
  });

  // Garis pemisah
  page.drawLine({
    start: { x: 200, y: 470 },
    end: { x: 600, y: 470 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Kalimat pembuka
  page.drawText("This certificate is proudly presented to", {
    x: 260,
    y: 430,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  // Nama besar
  const nameText = data.studentName;
  const nameWidth = titleFont.widthOfTextAtSize(nameText, 28);
  page.drawText(nameText, {
    x: 400 - nameWidth / 2,
    y: 390,
    size: 28,
    font: titleFont,
    color: rgb(0, 0, 0),
  });

  // Ucapan penghargaan
  page.drawText(
    data.additionalText || "For your exceptional performance this month, in appreciation for your loyalty and achieving company goals",
    {
      x: 100,
      y: 360,
      size: 12,
      font: italicFont,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: 600,
      lineHeight: 14,
    }
  );

  // Tanda tangan kiri
  page.drawText(data.issuerName || "Juliana Silva", {
    x: 100,
    y: 120,
    size: 12,
    font: titleFont,
    color: rgb(0, 0, 0),
  });
  page.drawText("Vice President", {
    x: 100,
    y: 105,
    size: 10,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Tanda tangan kanan
  page.drawText("Murad Naser", {
    x: 600,
    y: 120,
    size: 12,
    font: titleFont,
    color: rgb(0, 0, 0),
  });
  page.drawText("Manager", {
    x: 600,
    y: 105,
    size: 10,
    font: regularFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Certificate ID
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 300,
    y: 50,
    size: 10,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
