import { ClassStatus, SubmissionStatus } from "@prisma/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import {
  canManageClass,
  isClassParticipant,
} from "../../../utils/lms-access";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import {
  AssignmentEligibility,
  CertificateEligibilityDTO,
  CertificateEligibilityResult,
  CertificateQuery,
} from "./certificates.interface";
import { getCertificatesMapper } from "./certificates.mapper";
import {
  generateCertificateRepository,
  getCertificatesCountRepository,
  getCertificatesRepository,
  getCertificateUser,
  getClassAssignmentsRepository,
  getClassForEligibilityRepository,
  getUserSubmissionsByAssignmentsRepository,
} from "./certificates.repository";

/**
 * Single graduation check (M30-SPESIAL §1.1), shared by generate and
 * eligibility. A participant graduates iff: enrolled in the class,
 * not a class manager (creator, co-mentor, or admin), the class is
 * not DRAFT, the class has at least one assignment, and every
 * assignment has an APPROVE submission from them. Module completion
 * counts are deliberately NOT consulted. The completed flag does
 * not affect claiming, so completedAt is never read here.
 *
 * Counting is per assignment, never per submission row: submissions
 * have no unique constraint, so one assignment with several rows
 * still counts once.
 */
export const getCertificateEligibility = async (
  userId: string,
  classId: string
): Promise<CertificateEligibilityResult> => {
  const klass = await getClassForEligibilityRepository(classId);
  if (!klass) {
    return { kind: "not-found" };
  }
  if (!(await isClassParticipant(userId, classId))) {
    return { kind: "forbidden" };
  }

  const assignments = await getClassAssignmentsRepository(classId);
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const [submissions, certificate, isManager] = await Promise.all([
    getUserSubmissionsByAssignmentsRepository(userId, assignmentIds),
    getCertificateUser(userId, classId),
    canManageClass(userId, classId),
  ]);

  // Submissions arrive latest-first, so the first row seen per
  // assignment is its latest. APPROVE is checked separately: any
  // APPROVE row marks the assignment approved even if a later row
  // existed (unreachable in practice — APPROVE blocks resubmits).
  const latestByAssignment = new Map<string, SubmissionStatus>();
  const approvedIds = new Set<string>();
  for (const submission of submissions) {
    if (submission.status === SubmissionStatus.APPROVE) {
      approvedIds.add(submission.assignmentId);
    }
    if (!latestByAssignment.has(submission.assignmentId)) {
      latestByAssignment.set(submission.assignmentId, submission.status);
    }
  }

  const mapped: AssignmentEligibility[] = assignments.map((assignment) => {
    const latest = latestByAssignment.get(assignment.id);
    return {
      id: assignment.id,
      title: assignment.title,
      moduleId: assignment.moduleId,
      // The module relation is nullable in the schema, but moduleId
      // is a required foreign key, so a missing module is
      // unreachable; the empty string only satisfies the type.
      moduleName: assignment.module?.name ?? "",
      status: approvedIds.has(assignment.id)
        ? "APPROVED"
        : latest === SubmissionStatus.REVIEW
          ? "REVIEW"
          : latest === SubmissionStatus.REJECT
            ? "REJECT"
            : "NONE",
    };
  });

  const totalAssignments = assignments.length;
  const approvedAssignments = approvedIds.size;
  const eligible =
    !isManager &&
    klass.status !== ClassStatus.DRAFT &&
    totalAssignments > 0 &&
    approvedAssignments === totalAssignments;

  return {
    kind: "ok",
    eligible,
    totalAssignments,
    approvedAssignments,
    assignments: mapped,
    hasCertificate: !!certificate,
  };
};

export const generateCertificateService = async (
  classId: string,
  userId: string
) => {
  const eligibility = await getCertificateEligibility(userId, classId);
  if (eligibility.kind === "not-found") {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (eligibility.kind === "forbidden") {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ROLE,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }
  // One undifferentiated message for every graduation failure: the
  // caller must not learn which rule failed.
  if (!eligibility.eligible) {
    return new ErrorApp("Class not completed", 400, MESSAGE_CODE.BAD_REQUEST);
  }

  if (eligibility.hasCertificate) {
    return new ErrorApp(
      "Certificate already generated",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await generateCertificateRepository(userId, classId);
};

export const getCertificateEligibilityService = async (
  classId: string,
  userId: string
): Promise<CertificateEligibilityDTO | ErrorApp> => {
  const eligibility = await getCertificateEligibility(userId, classId);
  if (eligibility.kind === "not-found") {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (eligibility.kind === "forbidden") {
    return new ErrorApp(
      MESSAGES.ERROR.FORBIDDEN.ROLE,
      403,
      MESSAGE_CODE.FORBIDDEN
    );
  }
  return {
    eligible: eligibility.eligible,
    totalAssignments: eligibility.totalAssignments,
    approvedAssignments: eligibility.approvedAssignments,
    assignments: eligibility.assignments,
  };
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
