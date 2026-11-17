import { Jabatan, PrismaClient } from "@prisma/client";
import { ImagePath } from "../../../utils/image-path";

// Snapshot of the three signers, frozen at claim time so a later
// leadership rotation never rewrites an issued certificate. Stored
// in Certificate.signers as JSON, in exactly this shape.
export type CertificateSignerSnapshot = {
  name: string;
  signatureImage: string | null;
};

export type CertificateSignersSnapshot = {
  psdm: CertificateSignerSnapshot;
  kahim: CertificateSignerSnapshot;
  kaprodi: CertificateSignerSnapshot;
};

// The signer rows live in the CMS tables (same database, read via
// Prisma — no separate signer table). The PSDM head is found by
// the PSDM department code.
const PSDM_DEPARTMENT = "PSDM";
const KAPRODI_ROLE = "Ketua Prodi Teknik Informatika";

// Only the delegates this module touches, so both the global client
// and an interactive-transaction client can be passed in.
type SignerReader = Pick<PrismaClient, "structural" | "prodiStructural">;

// Signature images are stored as filenames (same as `image`);
// resolve to the public URL for the snapshot. A value that already
// looks like a URL is kept as-is, mirroring the structural mapper.
const toPublicSignatureUrl = (
  filename: string | null,
  folder: string
): string | null => {
  if (!filename) {
    return null;
  }
  if (filename.includes("https")) {
    return filename;
  }
  return ImagePath(`${folder}/${filename}`);
};

// Resolves the three currently active signers. Returns null when
// any signer row is missing — the caller decides whether that
// blocks (claim) or degrades (legacy /file render). A missing
// signature IMAGE never blocks: it snapshots as null and the PDF
// renders the signature zone empty.
export const resolveActiveSigners = async (
  db: SignerReader
): Promise<CertificateSignersSnapshot | null> => {
  const [kahim, psdm, kaprodi] = await Promise.all([
    db.structural.findFirst({
      where: { jabatan: Jabatan.KETUA_HIMPUNAN, isActive: true },
      include: { Member: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.structural.findFirst({
      where: {
        jabatan: Jabatan.KETUA_DEPARTMENT,
        department: PSDM_DEPARTMENT,
        isActive: true,
      },
      include: { Member: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.prodiStructural.findFirst({
      where: { role: KAPRODI_ROLE, isActive: true },
      orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!kahim || !psdm || !kaprodi) {
    return null;
  }

  return {
    psdm: {
      name: psdm.Member.name,
      signatureImage: toPublicSignatureUrl(psdm.signatureImage, "struktural"),
    },
    kahim: {
      name: kahim.Member.name,
      signatureImage: toPublicSignatureUrl(kahim.signatureImage, "struktural"),
    },
    kaprodi: {
      name: kaprodi.name,
      signatureImage: toPublicSignatureUrl(
        kaprodi.signatureImage,
        "prodi-structural"
      ),
    },
  };
};

// Defensive parse of the stored JSON snapshot: anything malformed
// degrades to null (legacy fallback) instead of crashing /file.
export const parseSignersSnapshot = (
  value: unknown
): CertificateSignersSnapshot | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const parseSigner = (entry: unknown): CertificateSignerSnapshot | null => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return null;
    }
    const { name, signatureImage } = entry as Record<string, unknown>;
    if (typeof name !== "string") {
      return null;
    }
    if (
      signatureImage !== null &&
      signatureImage !== undefined &&
      typeof signatureImage !== "string"
    ) {
      return null;
    }
    return { name, signatureImage: signatureImage ?? null };
  };

  const snapshot = value as Record<string, unknown>;
  const psdm = parseSigner(snapshot.psdm);
  const kahim = parseSigner(snapshot.kahim);
  const kaprodi = parseSigner(snapshot.kaprodi);
  if (!psdm || !kahim || !kaprodi) {
    return null;
  }
  return { psdm, kahim, kaprodi };
};

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

// The sequence number never resets; only the roman month + year
// come from the claim (issue) date, read in WIB (Asia/Jakarta).
// The server runs on UTC, so reading the date in server time would
// print the previous month for a claim made just after midnight
// WIB. WIB is UTC+7 with no daylight saving, so the Jakarta
// calendar date is the UTC date of (issue instant + 7 hours).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const buildFormalNumber = (sequence: number, date: Date): string => {
  const padded = String(sequence).padStart(3, "0");
  const jakarta = new Date(date.getTime() + WIB_OFFSET_MS);
  const month = ROMAN_MONTHS[jakarta.getUTCMonth()];
  const year = jakarta.getUTCFullYear();
  return `${padded}/KELOMPOK-BELAJAR/HIMTI-UMT/${month}/${year}`;
};
