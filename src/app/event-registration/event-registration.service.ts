import { RegistrationEventTypeEnum, RegistrationType } from "@prisma/client";
import sharp from "sharp";
import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";
import * as eventRegistrationRepository from "./event-registration.repository";
import {
  EventRegistrationCreationDTO,
  EventRegistrationDTO,
  EventRegistrationUpdateDTO,
} from "./event-registration.interface";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import * as registrationTypeRepository from "../registration-type/registration-type.repository";
import * as memberRepository from "../members/members.repository";
import { eventRegistrationMapper } from "./event-registration.mapper";
import {
  BUCKET_FOLDER,
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { environment } from "../../libs";
import { Meta } from "../../utils/meta";
import { Query } from "../../interface/Query";

export const create = async (
  payload:
    | EventRegistrationCreationDTO
    | (EventRegistrationCreationDTO & { image?: Express.Multer.File | string })
) => {
  const registrationType = await getRegistrationTypeOrThrow(
    payload.registrationTypeId
  );
  const unique = await assertUniqueRegistration(
    payload.userId,
    payload.eventId
  );
  if (unique instanceof ErrorApp) return unique;

  // Extract image file for validation
  const maybeFile = (payload as unknown as { image?: unknown }).image as
    | Express.Multer.File
    | string
    | undefined;

  if (payload.nim && payload.nim.trim() !== "" && payload.nim.trim() !== "-" && (payload.registrationTypeId || payload.eventId)) {
    const existing =
      await eventRegistrationRepository.getEventRegistrationByNIM(
        payload.nim,
        payload.registrationTypeId,
        payload.eventId
      );
    if (existing) {
      throw new ErrorApp(
        "NIM already registered",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  // Validate bootcamp-specific requirements
  const validateBootcamp = validateBootcampRequirements(
    registrationType,
    payload.generation,
    maybeFile
  );
  if (validateBootcamp instanceof ErrorApp) return validateBootcamp;
  let filename: string | undefined;
  const normalizedData = normalizePayload(payload, registrationType);
  try {
    if (maybeFile && typeof maybeFile !== "string") {
      const file = maybeFile as Express.Multer.File;
      if ((file.size as number) > 3 * 1024 * 1024) {
        throw new ErrorApp(
          "Image size exceeds 3MB",
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
      filename = `${file.originalname.replace(
        FileType[file.mimetype],
        ""
      )} - ${+new Date()}.webp`;
      const quality = file.size > 5 * 1024 * 1024 ? 75 : 100;
      const compress = await sharp(file.buffer).webp({ quality }).toBuffer();
      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.eventRegistration}/${filename}`,
        Body: compress,
        ContentType: "image/webp",
      });
      (normalizedData as EventRegistrationCreationDTO).image = filename;
    }

    const eventRegistration =
      await eventRegistrationRepository.createEventRegistrationRepository(
        normalizedData as EventRegistrationCreationDTO
      );
    return eventRegistrationMapper(eventRegistration, registrationType);
  } catch (error) {
    console.log({ error, filename });
    if (filename) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.eventRegistration}/${filename}`
      );
    }
    if (error instanceof ErrorApp) throw error;
    throw new ErrorApp(
      "Failed to create registration",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const findAll = async (): Promise<EventRegistrationDTO[]> => {
  const eventRegistrations =
    await eventRegistrationRepository.getEventRegistrationsRepository();
  const registrationTypeMap = await buildRegistrationTypeMap(
    eventRegistrations
      .map((item) => item.registrationTypeId)
      .filter((id): id is string => Boolean(id))
  );
  return eventRegistrations.map((eventRegistration) =>
    eventRegistrationMapper(
      eventRegistration,
      registrationTypeMap.get(eventRegistration.registrationTypeId ?? "") ||
        null
    )
  );
};

export const findById = async (id: string): Promise<EventRegistrationDTO> => {
  const eventRegistration =
    await eventRegistrationRepository.getEventRegistrationByIdRepository(id);
  if (!eventRegistration) {
    throw new ErrorApp(
      "Event registration not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const registrationType = eventRegistration.registrationTypeId
    ? await registrationTypeRepository.getRegistrationTypeByIdRepository(
        eventRegistration.registrationTypeId
      )
    : null;
  return eventRegistrationMapper(eventRegistration, registrationType ?? null);
};

export const update = async (
  id: string,
  payload: EventRegistrationUpdateDTO
): Promise<EventRegistrationDTO> => {
  const existing =
    await eventRegistrationRepository.getEventRegistrationByIdRepository(id);
  if (!existing) {
    throw new ErrorApp(
      "Event registration not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const registrationTypeId =
    payload.registrationTypeId ?? existing.registrationTypeId;
  if (!registrationTypeId) {
    throw new ErrorApp(
      "Registration type is required",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const registrationType = await getRegistrationTypeOrThrow(registrationTypeId);
  const normalizedData = normalizePayload(
    {
      ...payload,
      registrationTypeId,
    },
    registrationType,
    existing
  );
  const updatedEventRegistration =
    await eventRegistrationRepository.updateEventRegistrationRepository(
      id,
      normalizedData
    );
  return eventRegistrationMapper(updatedEventRegistration, registrationType);
};

export const remove = async (id: string): Promise<boolean> => {
  await eventRegistrationRepository.deleteEventRegistrationRepository(id);
  return true;
};

const getRegistrationTypeOrThrow = async (
  registrationTypeId: string
): Promise<RegistrationType> => {
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(
      registrationTypeId
    );
  if (!registrationType) {
    throw new ErrorApp(
      "Registration type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (!registrationType.isActive) {
    throw new ErrorApp(
      "Registration type is inactive",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  return registrationType;
};

const normalizePayload = (
  payload: EventRegistrationUpdateDTO | EventRegistrationCreationDTO,
  registrationType: RegistrationType,
  existing?: { class?: string | null; registrationTypeId?: string | null }
) => {
  const normalizedClass = resolveClassValue(
    registrationType,
    payload.class,
    existing?.class
  );
  return {
    ...payload,
    class: normalizedClass,
    registrationTypeId: registrationType.id,
  } as EventRegistrationUpdateDTO;
};

const resolveClassValue = (
  registrationType: RegistrationType,
  candidateClass?: string | null,
  fallbackClass?: string | null
) => {
  const resolved =
    typeof candidateClass !== "undefined" ? candidateClass : fallbackClass;
  if (!resolved || resolved.trim() === "") {
    throw new ErrorApp(
      "Class is required for event registration",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  return resolved.trim();
};

const buildRegistrationTypeMap = async (registrationTypeIds: string[]) => {
  const uniqueIds = Array.from(new Set(registrationTypeIds));
  const registrationTypes =
    await registrationTypeRepository.getRegistrationTypesByIdsRepository(
      uniqueIds
    );
  return new Map(registrationTypes.map((item) => [item.id, item]));
};

const assertUniqueRegistration = async (userId?: string, eventId?: string) => {
  if (!userId || !eventId) {
    return;
  }
  const existingRegistration =
    await eventRegistrationRepository.getExistEventRegistration(
      userId,
      eventId
    );
  if (existingRegistration) {
    return new ErrorApp(
      "User has already registered for this event",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

const validateBootcampRequirements = (
  registrationType: RegistrationType,
  generation?: number,
  imageFile?: Express.Multer.File | string
) => {
  if (registrationType.type === RegistrationEventTypeEnum.BOOTCAMP) {
    // Validate generation is required for bootcamp
    if (!generation || generation <= 0) {
      return new ErrorApp(
        "Generation is required for bootcamp registration",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    // Validate image is required for bootcamp
    if (!imageFile) {
      return new ErrorApp(
        "Image is required for bootcamp registration",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }
};

export const findByRegistrationType = async (
  registrationTypeId: string,
  query: Query
) => {
  const { page = "1", perPage = "10" } = query;
  // Validate registration type exists
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(
      registrationTypeId
    );
  if (!registrationType) {
    throw new ErrorApp(
      "Registration type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const result =
    await eventRegistrationRepository.getEventRegistrationsByRegistrationTypeRepository(
      registrationTypeId,
      query
    );

  const mappedData = result.data.map((eventRegistration) =>
    eventRegistrationMapper(eventRegistration, registrationType)
  );

  const meta = Meta(Number(page), Number(perPage), result.total);

  return {
    data: mappedData,
    meta,
  };
};

export const importMembers = async (
  registrationTypeId: string,
  generationId: string
) => {
  const registrations =
    await eventRegistrationRepository.getEventRegistrationsByRegistrationTypeNoPaginationRepository(
      registrationTypeId
    );

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const reg of registrations) {
    try {
      if (!reg.nim || !reg.name) {
        skipped++;
        continue;
      }

      // Check if member already exists
      const existingMember = await memberRepository.getMemberByNIM(reg.nim);
      if (existingMember) {
        skipped++;
        continue;
      }

      // Create Member
      await memberRepository.createMember({
        name: reg.name,
        nim: reg.nim,
        generationId,
        isActive: true,
      });

      success++;
    } catch (error) {
      console.error(`Failed to import member from reg ${reg.id}:`, error);
      failed++;
    }
  }

  return {
    success,
    skipped,
    failed,
    totalProcessed: registrations.length,
  };
};

export const generateAbsensiDocument = async (
  registrationTypeId: string,
  format: "docx" | "pdf",
  category: "MAHASISWA" | "UMUM"
): Promise<Buffer> => {
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(
      registrationTypeId
    );
  if (!registrationType) {
    throw new ErrorApp(
      "Registration type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const registrations =
    await eventRegistrationRepository.getEventRegistrationsByRegistrationTypeNoPaginationRepository(
      registrationTypeId
    );

  // Filter registrations based on category
  const filteredRegistrations = registrations.filter((reg) => {
    const isUmum =
      reg.nim === "-" ||
      !reg.nim ||
      reg.class?.toLowerCase().includes("umum") ||
      (reg.institution && reg.institution.toLowerCase() !== "universitas muhammadiyah tangerang" && reg.institution.toLowerCase() !== "umt");
    return category === "UMUM" ? isUmum : !isUmum;
  });

  const eventTitle = registrationType.name;

  if (format === "pdf") {
    return generatePdfAbsensi(eventTitle, filteredRegistrations, category);
  } else {
    return generateDocxAbsensi(eventTitle, filteredRegistrations, category);
  }
};

const generatePdfAbsensi = (
  eventTitle: string,
  registrations: any[],
  category: "MAHASISWA" | "UMUM"
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Header Text
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("HIMPUNAN MAHASISWA TEKNIK INFORMATIKA", { align: "center" });
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("UNIVERSITAS MUHAMMADIYAH TANGERANG", { align: "center" });
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "Jl. Perintis Kemerdekaan I No. 33 Kel. Babakan, Kec. Tangerang,\nKota Tangerang, Banten 15118 | No. Telp: 085136392300 (Kominfo)\nwww.himtiumt.or.id",
        { align: "center" }
      );

    doc.moveDown(0.5);

    // Header Lines (Yellow & Green/Gray)
    const yLine = doc.y;
    doc.lineWidth(2).strokeColor("#EAB308").moveTo(40, yLine).lineTo(555, yLine).stroke();
    doc.lineWidth(2).strokeColor("#22C55E").moveTo(40, yLine + 3).lineTo(555, yLine + 3).stroke();

    doc.moveDown(1.5);

    // Title
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`ABSENSI ACARA ${eventTitle.toUpperCase()}`, { align: "center" });

    doc.moveDown(1);

    // Table Setup
    const startX = 40;
    let currentY = doc.y;

    // Define Columns based on Category
    // MAHASISWA: No (30), Nama Lengkap (180), NIM (80), Prodi (95), Ttd (90) = 475
    // UMUM: No (30), Nama Lengkap (200), Instansi (155), Ttd (90) = 475
    const isMhs = category === "MAHASISWA";
    const headers = isMhs
      ? ["No", "Nama Lengkap", "NIM", "Prodi", "Ttd"]
      : ["No", "Nama Lengkap", "Instansi / Asal Sekolah / Kampus", "Ttd"];

    const colWidths = isMhs ? [30, 180, 80, 95, 90] : [30, 200, 155, 90];

    const drawHeader = () => {
      doc.rect(startX, currentY, 475, 25).fillAndStroke("#D1E7DD", "#000000");

      let xPos = startX;
      doc.fillColor("#000000").fontSize(10).font("Helvetica-Bold");

      headers.forEach((header, idx) => {
        doc.text(header, xPos + 5, currentY + 7, {
          width: colWidths[idx] - 10,
          align: idx === 0 ? "center" : "left",
        });
        xPos += colWidths[idx];
      });

      currentY += 25;
    };

    drawHeader();

    // Draw Rows (Include empty rows up to 20 if less than 20)
    const rowCount = Math.max(registrations.length, 20);

    for (let i = 0; i < rowCount; i++) {
      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
        drawHeader();
      }

      const item = registrations[i] || {};
      const noStr = `${i + 1}.`;
      const ttdStr = `${i + 1}.`;
      const ttdIndent = i % 2 === 1 ? 40 : 5; // Zig-zag signature layout matching template

      doc.rect(startX, currentY, 475, 24).strokeColor("#000000").lineWidth(0.5).stroke();

      let xPos = startX;
      doc.fillColor("#000000").fontSize(9).font("Helvetica");

      // Column 0: No
      doc.text(`${i + 1}`, xPos, currentY + 7, {
        width: colWidths[0],
        align: "center",
      });
      xPos += colWidths[0];

      // Column 1: Nama Lengkap
      doc.text(item.name || "", xPos + 5, currentY + 7, {
        width: colWidths[1] - 10,
        align: "left",
      });
      xPos += colWidths[1];

      if (isMhs) {
        // Column 2: NIM
        doc.text(item.nim || "-", xPos + 5, currentY + 7, {
          width: colWidths[2] - 10,
          align: "left",
        });
        xPos += colWidths[2];

        // Column 3: Prodi
        doc.text(item.prodi || "-", xPos + 5, currentY + 7, {
          width: colWidths[3] - 10,
          align: "left",
        });
        xPos += colWidths[3];
      } else {
        // Column 2: Instansi
        doc.text(item.institution || item.class || "-", xPos + 5, currentY + 7, {
          width: colWidths[2] - 10,
          align: "left",
        });
        xPos += colWidths[2];
      }

      // Column Ttd (Zig Zag)
      doc.fontSize(8).text(ttdStr, xPos + ttdIndent, currentY + 6, {
        width: colWidths[colWidths.length - 1] - ttdIndent,
        align: "left",
      });

      currentY += 24;
    }

    doc.end();
  });
};

const generateDocxAbsensi = async (
  eventTitle: string,
  registrations: any[],
  category: "MAHASISWA" | "UMUM"
): Promise<Buffer> => {
  const isMhs = category === "MAHASISWA";
  const rowCount = Math.max(registrations.length, 20);

  const headerCells = isMhs
    ? ["No", "Nama Lengkap", "NIM", "Prodi", "Ttd"]
    : ["No", "Nama Lengkap", "Instansi / Asal Sekolah / Kampus", "Ttd"];

  const colWidths = isMhs ? [600, 3000, 1500, 2000, 1900] : [600, 3500, 3000, 1900];

  const tableRows = [
    // Header Row
    new TableRow({
      children: headerCells.map(
        (text, idx) =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text, bold: true, size: 20 })],
              }),
            ],
            shading: { fill: "D1E7DD" },
            width: { size: colWidths[idx], type: WidthType.DXA },
          })
      ),
    }),
  ];

  for (let i = 0; i < rowCount; i++) {
    const item = registrations[i] || {};
    const ttdIndent = i % 2 === 1 ? "      " : "";
    const cells = [
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `${i + 1}`, size: 18 })],
          }),
        ],
        width: { size: colWidths[0], type: WidthType.DXA },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: item.name || "", size: 18 })],
          }),
        ],
        width: { size: colWidths[1], type: WidthType.DXA },
      }),
    ];

    if (isMhs) {
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.nim || "-", size: 18 })],
            }),
          ],
          width: { size: colWidths[2], type: WidthType.DXA },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: item.prodi || "-", size: 18 })],
            }),
          ],
          width: { size: colWidths[3], type: WidthType.DXA },
        })
      );
    } else {
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.institution || item.class || "-",
                  size: 18,
                }),
              ],
            }),
          ],
          width: { size: colWidths[2], type: WidthType.DXA },
        })
      );
    }

    // Ttd Cell
    cells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `${ttdIndent}${i + 1}.`, size: 16 }),
            ],
          }),
        ],
        width: { size: colWidths[colWidths.length - 1], type: WidthType.DXA },
      })
    );

    tableRows.push(new TableRow({ children: cells }));
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "HIMPUNAN MAHASISWA TEKNIK INFORMATIKA",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "UNIVERSITAS MUHAMMADIYAH TANGERANG",
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Jl. Perintis Kemerdekaan I No. 33 Kel. Babakan, Kec. Tangerang, Kota Tangerang, Banten 15118 | No. Telp: 085136392300 (Kominfo)\nwww.himtiumt.or.id",
                size: 16,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `ABSENSI ACARA ${eventTitle.toUpperCase()}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Table({
            rows: tableRows,
            alignment: AlignmentType.CENTER,
            width: { size: 9000, type: WidthType.DXA },
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
