import axios from "axios";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PDFImage,
  PDFFont,
  PDFPage,
  RGB,
  rgb,
  StandardFonts,
} from "pdf-lib";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { CertificateSignersSnapshot } from "./certificate-signers";

// Certificate PDF template, ported from the approved preview
// (~/workspace/cert-preview/generate.js). Layout constants, copy,
// and structure are kept as-is; do not redesign here.
//
// Font attribution: the recipient name is set in Great Vibes
// (Copyright 2010 The Great Vibes Project Authors,
// https://github.com/googlefonts/great-vibes), licensed under the
// SIL Open Font License 1.1. The bundled TTF is
// assets/GreatVibes-Regular.ttf.

export type CertificateTemplateRole = "PESERTA" | "PEMATERI";

export interface CertificateTemplateData {
  recipientName: string;
  className: string;
  categoryName: string;
  role: CertificateTemplateRole;
  // Null for legacy certificates: no formal-number row is printed.
  formalNumber: string | null;
  verificationCode: string;
  signers: CertificateSignersSnapshot;
}

const W = 841.89;
const H = 595.28;
const CX = W / 2;

const NAVY = rgb(0.09, 0.16, 0.42);
const NAVY_DARK = rgb(0.05, 0.12, 0.35);
const BADGE = rgb(0.1, 0.25, 0.65);
const NAME_BLUE = rgb(0.3, 0.33, 0.62);
const INK = rgb(0.12, 0.12, 0.12);
const GRAY = rgb(0.4, 0.4, 0.4);

// Printed signer labels are fixed in the template, not read from
// the CMS. The print label says SDM; the department lookup key
// stays PSDM (explicit decision — do not "fix").
const SIGNER_BLOCKS: Array<{
  key: keyof CertificateSignersSnapshot;
  label: string[];
  cx: number;
}> = [
  { key: "psdm", label: ["KEPALA DEPARTEMEN SDM", "HIMTI UMT"], cx: 155 },
  { key: "kahim", label: ["KETUA HIMPUNAN", "HIMTI UMT"], cx: 421 },
  {
    key: "kaprodi",
    label: [
      "KAPRODI TEKNIK INFORMATIKA",
      "UNIVERSITAS MUHAMMADIYAH",
      "TANGERANG",
    ],
    cx: 687,
  },
];

// pdf-lib reads embedded bytes through `new DataView(bytes.buffer)`
// starting at offset 0, IGNORING the view's byteOffset. Node Buffers
// from fs.readFileSync, axios, and sharp are routinely allocated
// inside a shared pool with byteOffset > 0, so passing them to
// pdf-lib directly fails nondeterministically (proven: a valid
// JPEG failed embedJpg with "SOI not found" until copied). Every
// byte array handed to pdf-lib MUST go through this copy first.
const toExactBytes = (buffer: Buffer | Uint8Array): Uint8Array =>
  buffer instanceof Uint8Array &&
  buffer.byteOffset === 0 &&
  buffer.byteLength === buffer.buffer.byteLength
    ? buffer
    : new Uint8Array(buffer);

// Bundled assets (2 PNG logos + 1 TTF) are read once per process
// and cached in memory. Resolution tries, in order:
// 1. next to this module (ts-node dev, or a build that copies assets
//    beside the compiled output),
// 2. the src tree relative to the compiled output (Vercel: the
//    function bundle keeps src/** via includeFiles, dist/ is four
//    levels below the project root),
// 3. the src tree relative to the working directory (repo-root runs).
// The literal path segments keep the files visible to @vercel/nft.
const assetCache = new Map<string, Uint8Array>();

const readAsset = (filename: string): Uint8Array => {
  const cached = assetCache.get(filename);
  if (cached) {
    return cached;
  }
  const candidates = [
    path.join(__dirname, "assets", filename),
    path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "src",
      "app",
      "lms",
      "certificates",
      "assets",
      filename
    ),
    path.join(
      process.cwd(),
      "src",
      "app",
      "lms",
      "certificates",
      "assets",
      filename
    ),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const bytes = toExactBytes(fs.readFileSync(candidate));
      assetCache.set(filename, bytes);
      return bytes;
    }
  }
  throw new Error(`Certificate asset not found: ${filename}`);
};

const drawCentered = (
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  cx: number,
  y: number,
  color: RGB
): void => {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: cx - w / 2, y, size, font, color });
};

// Shrinks the size until the text fits maxWidth (long names must
// not overflow the page); normal-length text keeps the exact size.
const fitSize = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  minSize: number
): number => {
  let fitted = size;
  while (
    fitted > minSize &&
    font.widthOfTextAtSize(text, fitted) > maxWidth
  ) {
    fitted -= 1;
  }
  return fitted;
};

const wrapLines = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const drawPill = (
  page: PDFPage,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: RGB
): void => {
  const r = h / 2;
  page.drawRectangle({
    x: cx - w / 2 + r,
    y: cy - r,
    width: w - 2 * r,
    height: h,
    color,
  });
  page.drawCircle({ x: cx - w / 2 + r, y: cy, size: r, color });
  page.drawCircle({ x: cx + w / 2 - r, y: cy, size: r, color });
};

const drawDots = (
  page: PDFPage,
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  cols: number,
  rows: number,
  color: RGB
): void => {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const r = 2.4 - i * 0.22 - j * 0.18;
      if (r < 0.5) continue;
      page.drawCircle({
        x: x0 + i * dx,
        y: y0 + j * dy,
        size: r,
        color,
        opacity: 0.85,
      });
    }
  }
};

// Signature fetch limits: a hung or huge object must never hang
// /file. Anything over the cap, or slower than the timeout, is
// treated as "no signature image" (see embedSignature).
const SIGNATURE_FETCH_TIMEOUT_MS = 5000;
const SIGNATURE_MAX_BYTES = 5 * 1024 * 1024;

// Signature image zone: between the label block (bottom edge
// y=190) and the name line (y=122). Images are bottom-aligned at
// y=128 and scaled to fit this box, preserving aspect ratio.
const SIGNATURE_ZONE_WIDTH = 110;
const SIGNATURE_ZONE_HEIGHT = 58;
const SIGNATURE_ZONE_BOTTOM = 128;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const isPng = (buffer: Buffer): boolean =>
  buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_MAGIC);

const isJpeg = (buffer: Buffer): boolean =>
  buffer.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

// Fetches a signature image from its snapshot URL and embeds it.
// Any failure (bad URL, timeout, oversize, undecodable bytes) is
// logged and returns null: the certificate renders with an empty
// signature zone instead of crashing /file. Uploads store PNG, but
// anything else decodable (webp, ...) is converted via sharp as a
// fallback, because pdf-lib can only embed PNG/JPEG.
const embedSignature = async (
  pdfDoc: PDFDocument,
  url: string | null,
  signerKey: string
): Promise<PDFImage | null> => {
  if (!url) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.error(`Certificate signature URL is invalid (${signerKey})`);
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    console.error(`Certificate signature URL scheme rejected (${signerKey})`);
    return null;
  }
  try {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: SIGNATURE_FETCH_TIMEOUT_MS,
      maxContentLength: SIGNATURE_MAX_BYTES,
    });
    let buffer = Buffer.from(response.data);
    if (isPng(buffer)) {
      return await pdfDoc.embedPng(toExactBytes(buffer));
    }
    if (isJpeg(buffer)) {
      return await pdfDoc.embedJpg(toExactBytes(buffer));
    }
    buffer = await sharp(buffer).png().toBuffer();
    return await pdfDoc.embedPng(toExactBytes(buffer));
  } catch (error) {
    console.error(
      `Failed to embed certificate signature (${signerKey}):`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
};

export const renderCertificatePdf = async (
  data: CertificateTemplateData
): Promise<Uint8Array> => {
  const isMentor = data.role === "PEMATERI";
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([W, H]);

  const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const script = await pdfDoc.embedFont(readAsset("GreatVibes-Regular.ttf"));

  const umtImg = await pdfDoc.embedPng(readAsset("umt-emblem.png"));
  const himtiImg = await pdfDoc.embedPng(readAsset("himti-logo.png"));

  // ---- Corner decorations ----
  page.drawCircle({ x: -60, y: 640, size: 150, color: NAVY_DARK });
  page.drawCircle({
    x: -60,
    y: 640,
    size: 168,
    borderColor: NAVY,
    borderWidth: 1.5,
  });
  page.drawCircle({ x: 902, y: -45, size: 150, color: NAVY_DARK });
  page.drawCircle({
    x: 902,
    y: -45,
    size: 168,
    borderColor: NAVY,
    borderWidth: 1.5,
  });
  drawDots(page, 826, 578, -15, -15, 5, 4, NAVY);
  drawDots(page, 20, 22, 15, 15, 5, 4, NAVY);

  // ---- Logos ----
  page.drawImage(umtImg, { x: 88, y: 492, width: 64, height: 66.6 });
  page.drawImage(himtiImg, { x: 668, y: 492, width: 100, height: 80 });

  // ---- Title + formal number ----
  drawCentered(page, "S E R T I F I K A T", timesBold, 38, CX, 520, NAVY);
  if (data.formalNumber) {
    drawCentered(
      page,
      `NOMOR: ${data.formalNumber}`,
      helv,
      9,
      CX,
      498,
      GRAY
    );
  }

  // ---- Recipient ----
  drawCentered(page, "Dengan ini diberikan kepada:", times, 13, CX, 452, INK);
  const nameSize = fitSize(data.recipientName, script, 46, 700, 20);
  drawCentered(page, data.recipientName, script, nameSize, CX, 402, NAME_BLUE);
  drawCentered(page, "sebagai", timesItalic, 12, CX, 368, INK);

  // ---- Role pill ----
  const badgeText = isMentor ? "PEMATERI" : "PESERTA";
  const badgeW = helvBold.widthOfTextAtSize(badgeText, 13) + 52;
  drawPill(page, CX, 340, badgeW, 26, BADGE);
  drawCentered(page, badgeText, helvBold, 13, CX, 335.5, rgb(1, 1, 1));

  // ---- Body copy (verbatim, placeholders only) ----
  const bidang = isMentor
    ? `spesialis bidang "${data.categoryName}"`
    : `bidang "${data.categoryName}"`;
  const body =
    `Sertifikat ini diberikan kepada ( ${data.recipientName} ) selaku ` +
    badgeText +
    " kegiatan KELOMPOK BELAJAR " +
    bidang +
    ` — telah menyelesaikan kelas "${data.className}".`;
  const bodyLines = wrapLines(body, times, 12.5, 620);
  bodyLines.forEach((line, i) => {
    drawCentered(page, line, times, 12.5, CX, 306 - i * 19, INK);
  });

  // ---- Signature blocks ----
  const embedded = await Promise.all(
    SIGNER_BLOCKS.map((block) =>
      embedSignature(pdfDoc, data.signers[block.key].signatureImage, block.key)
    )
  );
  SIGNER_BLOCKS.forEach((block, index) => {
    const signer = data.signers[block.key];
    // Label: bottom-aligned at y=190, lines stacking upward.
    block.label.forEach((line, i) => {
      drawCentered(
        page,
        line,
        helvBold,
        8.5,
        block.cx,
        190 + (block.label.length - 1 - i) * 11,
        INK
      );
    });
    // Signature image zone: empty when there is no image (no
    // placeholder text — the preview placeholder was preview-only).
    const image = embedded[index];
    if (image) {
      const scale = Math.min(
        SIGNATURE_ZONE_WIDTH / image.width,
        SIGNATURE_ZONE_HEIGHT / image.height
      );
      const width = image.width * scale;
      const height = image.height * scale;
      page.drawImage(image, {
        x: block.cx - width / 2,
        y: SIGNATURE_ZONE_BOTTOM,
        width,
        height,
      });
    }
    // Line + name
    page.drawLine({
      start: { x: block.cx - 62, y: 122 },
      end: { x: block.cx + 62, y: 122 },
      thickness: 0.75,
      color: INK,
    });
    const signerNameSize = fitSize(signer.name, helvBold, 10.5, 150, 8);
    drawCentered(page, signer.name, helvBold, signerNameSize, block.cx, 106, INK);
  });

  // ---- Footer ----
  drawCentered(
    page,
    `Kode Verifikasi: ${data.verificationCode} — verifikasi keaslian di himtiumt.org/sertifikat`,
    helv,
    8,
    CX,
    42,
    GRAY
  );

  return await pdfDoc.save();
};
