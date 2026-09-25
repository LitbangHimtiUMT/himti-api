import { RegistrationEventTypeEnum, RegistrationType } from "@prisma/client";
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";
import { createReport } from "docx-templates";
import { promisify } from "util";
// libreoffice-convert has no bundled types; require via CJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const libreOfficeConvert = require("libreoffice-convert");
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

// Prefer the `.convertWithOptions` signature so we can pass a custom
// soffice binary path via the LIBREOFFICE_PATH environment variable.
// Fallback silently to auto-discovery when the variable is not set.
const libreConvertRaw: (
  input: Buffer,
  format: string,
  filter: string | undefined,
  options: Record<string, unknown> | undefined,
  cb: (err: Error | null, buf: Buffer) => void
) => void = libreOfficeConvert.convertWithOptions;

const libreConvertAsync = (
  input: Buffer,
  format: string,
  filter: string | undefined
): Promise<Buffer> => {
  const overridePath = process.env.LIBREOFFICE_PATH;
  const options = overridePath
    ? { sofficeBinaryPaths: [overridePath] }
    : undefined;
  return new Promise((resolve, reject) => {
    libreConvertRaw(input, format, filter, options, (err, buf) => {
      if (err) reject(err);
      else resolve(buf);
    });
  });
};

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

  const maybeFile = (payload as unknown as { image?: unknown }).image as
    | Express.Multer.File
    | string
    | undefined;

  if (
    payload.nim &&
    payload.nim.trim() !== "" &&
    payload.nim.trim() !== "-" &&
    (payload.registrationTypeId || payload.eventId)
  ) {
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
    { ...payload, registrationTypeId },
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
  if (!userId || !eventId) return;
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
    if (!generation || generation <= 0) {
      return new ErrorApp(
        "Generation is required for bootcamp registration",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
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

  return { data: mappedData, meta };
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
      const existingMember = await memberRepository.getMemberByNIM(reg.nim);
      if (existingMember) {
        skipped++;
        continue;
      }
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

  return { success, skipped, failed, totalProcessed: registrations.length };
};

// ============================================================================
// ABSENSI DOCUMENT GENERATION
// ----------------------------------------------------------------------------
// This module fills the static template file `ABSENSI.template.docx` located
// at the project root. The template is generated once from the original
// `ABSENSI.docx` via `scripts/prepare-absensi-template.js` and contains
// docx-templates tokens ({INS eventTitle}, {FOR row IN rows} ... {END-FOR row},
// {INS $row.no}, {INS $row.name}, {INS $row.detail}, {INS $row.ttd},
// {INS columnHeader}).
//
// We DO NOT regenerate the document layout in code - only participant data is
// injected so the output preserves the HIMTI kop surat, decoration lines,
// header/footer images and table styling defined in the template.
//
// PDF output is produced by first rendering the DOCX and then converting it
// with LibreOffice via `libreoffice-convert`. LibreOffice (soffice) must be
// installed on the server host for PDF conversion to work.
// ============================================================================

type AbsensiRow = {
  no: string;
  name: string;
  detail: string;
  ttd: string;
};

const ABSENSI_TEMPLATE_PATH = path.join(
  process.cwd(),
  "ABSENSI.template.docx"
);

const isUmumRegistration = (reg: {
  nim?: string | null;
  class?: string | null;
  institution?: string | null;
}): boolean => {
  const institutionLower = (reg.institution ?? "").toLowerCase();
  const isUmtInstitution =
    institutionLower === "universitas muhammadiyah tangerang" ||
    institutionLower === "umt";
  return (
    reg.nim === "-" ||
    !reg.nim ||
    (reg.class ?? "").toLowerCase().includes("umum") ||
    (!!reg.institution && !isUmtInstitution)
  );
};

const buildAbsensiRows = (
  registrations: Array<Record<string, unknown>>,
  category: "MAHASISWA" | "UMUM"
): AbsensiRow[] => {
  // Match the template's default of 20 rows so blank signature slots are kept
  // when participants < 20 (identical to the original ABSENSI.docx look).
  const minRows = 20;
  const rowsCount = Math.max(registrations.length, minRows);
  const rows: AbsensiRow[] = [];

  for (let i = 0; i < rowsCount; i++) {
    const reg = (registrations[i] ?? {}) as {
      name?: string;
      nim?: string;
      prodi?: string;
      institution?: string;
      class?: string;
    };
    const hasData = i < registrations.length;
    let detail = "";
    if (hasData) {
      if (category === "MAHASISWA") {
        const nim = reg.nim && reg.nim !== "-" ? reg.nim : "";
        const prodi = reg.prodi ?? "";
        detail = [nim, prodi].filter(Boolean).join(" - ") || "-";
      } else {
        detail = reg.institution || reg.class || "-";
      }
    }
    rows.push({
      no: String(i + 1),
      name: hasData ? reg.name ?? "" : "",
      detail,
      ttd: `${i + 1}.`,
    });
  }

  return rows;
};

const getColumnHeader = (category: "MAHASISWA" | "UMUM") =>
  category === "MAHASISWA"
    ? "NIM & Prodi"
    : "Instansi / Asal Sekolah / Kampus";

const generateDocxFromTemplate = async (
  eventTitle: string,
  registrations: Array<Record<string, unknown>>,
  category: "MAHASISWA" | "UMUM"
): Promise<Buffer> => {
  if (!fs.existsSync(ABSENSI_TEMPLATE_PATH)) {
    throw new ErrorApp(
      `Absensi template not found at ${ABSENSI_TEMPLATE_PATH}. Run 'node scripts/prepare-absensi-template.js' to generate it.`,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }

  const template = fs.readFileSync(ABSENSI_TEMPLATE_PATH);
  const rows = buildAbsensiRows(registrations, category);

  const output = await createReport({
    template,
    data: {
      eventTitle: eventTitle.toUpperCase(),
      columnHeader: getColumnHeader(category),
      rows,
    },
    cmdDelimiter: ["{", "}"],
  });

  return Buffer.from(output);
};

// ----------------------------------------------------------------------------
// PDF conversion strategy:
//   1. If CLOUDCONVERT_API_KEY is set -> use CloudConvert (recommended for
//      serverless / Vercel deployments where LibreOffice cannot be installed).
//   2. Otherwise -> use local LibreOffice via libreoffice-convert (dev &
//      self-hosted server deployments).
// ----------------------------------------------------------------------------

// Minimal typed subset of the CloudConvert v2 Job response we care about.
type CloudConvertTask = {
  id: string;
  name: string;
  operation: string;
  status: string;
  message?: string | null;
  result?: {
    form?: { url: string; parameters: Record<string, string> };
    files?: Array<{ filename: string; url: string }>;
  } | null;
};
type CloudConvertJob = {
  id: string;
  status: "waiting" | "processing" | "finished" | "error";
  tasks: CloudConvertTask[];
};

const CLOUDCONVERT_API_BASE = "https://api.cloudconvert.com/v2";
const CLOUDCONVERT_MAX_WAIT_MS = 60_000; // hard cap on total polling time
const CLOUDCONVERT_POLL_INTERVAL_MS = 1_500;

const convertDocxToPdfViaCloudConvert = async (
  docxBuffer: Buffer,
  apiKey: string
): Promise<Buffer> => {
  const authHeader = { Authorization: `Bearer ${apiKey}` };

  // 1) Create a job: import-upload -> convert -> export-url
  const createRes = await fetch(`${CLOUDCONVERT_API_BASE}/jobs`, {
    method: "POST",
    headers: {
      ...authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-doc": { operation: "import/upload" },
        "convert-doc": {
          operation: "convert",
          input: "import-doc",
          input_format: "docx",
          output_format: "pdf",
          engine: "libreoffice",
        },
        "export-doc": {
          operation: "export/url",
          input: "convert-doc",
          inline: false,
          archive_multiple_files: false,
        },
      },
      tag: "absensi",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(
      `CloudConvert job creation failed (HTTP ${createRes.status}): ${text.substring(
        0,
        300
      )}`
    );
  }

  const createJson = (await createRes.json()) as { data: CloudConvertJob };
  const job = createJson.data;
  const importTask = job.tasks.find((t) => t.name === "import-doc");
  if (!importTask?.result?.form?.url) {
    throw new Error(
      "CloudConvert did not return an import upload form. Response: " +
        JSON.stringify(job).substring(0, 300)
    );
  }

  // 2) Upload the docx buffer using the provided multipart form target
  const { url: uploadUrl, parameters } = importTask.result.form;
  const uploadForm = new FormData();
  for (const [k, v] of Object.entries(parameters)) uploadForm.append(k, v);
  uploadForm.append(
    "file",
    new Blob([new Uint8Array(docxBuffer)], {
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    "absensi.docx"
  );
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: uploadForm,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(
      `CloudConvert file upload failed (HTTP ${uploadRes.status}): ${text.substring(
        0,
        300
      )}`
    );
  }

  // 3) Poll job status until finished
  const started = Date.now();
  let finalJob: CloudConvertJob | null = null;
  while (Date.now() - started < CLOUDCONVERT_MAX_WAIT_MS) {
    await new Promise((r) => setTimeout(r, CLOUDCONVERT_POLL_INTERVAL_MS));
    const pollRes = await fetch(`${CLOUDCONVERT_API_BASE}/jobs/${job.id}`, {
      headers: authHeader,
    });
    if (!pollRes.ok) continue;
    const pollJson = (await pollRes.json()) as { data: CloudConvertJob };
    if (pollJson.data.status === "finished") {
      finalJob = pollJson.data;
      break;
    }
    if (pollJson.data.status === "error") {
      const failedTask = pollJson.data.tasks.find(
        (t) => t.status === "error"
      );
      throw new Error(
        `CloudConvert job failed: ${failedTask?.message ?? "unknown error"}`
      );
    }
  }

  if (!finalJob) {
    throw new Error(
      `CloudConvert job timed out after ${CLOUDCONVERT_MAX_WAIT_MS}ms`
    );
  }

  // 4) Download the resulting PDF
  const exportTask = finalJob.tasks.find((t) => t.name === "export-doc");
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  if (!fileUrl) {
    throw new Error("CloudConvert export task did not produce a file URL");
  }
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) {
    throw new Error(
      `CloudConvert result download failed (HTTP ${fileRes.status})`
    );
  }
  const arrayBuf = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuf);
};

const convertDocxBufferToPdf = async (docxBuffer: Buffer): Promise<Buffer> => {
  const cloudApiKey = process.env.CLOUDCONVERT_API_KEY?.trim();

  // Preferred path for serverless / production: CloudConvert
  if (cloudApiKey) {
    try {
      return await convertDocxToPdfViaCloudConvert(docxBuffer, cloudApiKey);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown CloudConvert error";
      throw new ErrorApp(
        `Failed to convert DOCX to PDF via CloudConvert. Verify CLOUDCONVERT_API_KEY is valid and has task.write / task.read scopes. Details: ${message}`,
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Local / self-hosted path: LibreOffice
  try {
    return await libreConvertAsync(docxBuffer, ".pdf", undefined);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown conversion error";
    const hint =
      process.platform === "win32"
        ? [
            "LibreOffice was not found. Install it or set the LIBREOFFICE_PATH env var.",
            "Windows install (winget): winget install -e --id TheDocumentFoundation.LibreOffice",
            "Default install path checked: C:\\Program Files\\LibreOffice\\program\\soffice.exe",
            "Or set env: LIBREOFFICE_PATH=C:\\path\\to\\soffice.exe",
            "For serverless / Vercel: set CLOUDCONVERT_API_KEY instead.",
          ].join(" | ")
        : process.platform === "linux"
        ? "LibreOffice was not found. On self-hosted: sudo apt-get install -y libreoffice --no-install-recommends. On serverless/Vercel: set CLOUDCONVERT_API_KEY env var to use CloudConvert."
        : "LibreOffice was not found. Install it or set the LIBREOFFICE_PATH env var, or set CLOUDCONVERT_API_KEY for serverless environments.";
    throw new ErrorApp(
      `Failed to convert DOCX to PDF via LibreOffice. ${hint} Details: ${message}`,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const generateAbsensiDocument = async (
  registrationTypeId: string,
  format: "docx" | "pdf",
  category: "MAHASISWA" | "UMUM"
): Promise<{ buffer: Buffer; eventName: string }> => {
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

  const filteredRegistrations = registrations.filter((reg) => {
    const umum = isUmumRegistration(reg);
    return category === "UMUM" ? umum : !umum;
  });

  const eventTitle = registrationType.name;

  const docxBuffer = await generateDocxFromTemplate(
    eventTitle,
    filteredRegistrations as Array<Record<string, unknown>>,
    category
  );

  if (format === "pdf") {
    const pdf = await convertDocxBufferToPdf(docxBuffer);
    return { buffer: pdf, eventName: eventTitle };
  }
  return { buffer: docxBuffer, eventName: eventTitle };
};