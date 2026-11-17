import { Jabatan } from "@prisma/client";

// HIMTI departments. The CMS offers these as the `department`
// dropdown for structural rows; the certificate signer lookup
// matches KETUA_DEPARTMENT rows by the PSDM code.
export const DEPARTMENT_CODES = [
  "PSDM",
  "LITBANG",
  "DANUS",
  "KOMINFO",
  "ORGANISASI",
] as const;

export type DepartmentCode = (typeof DEPARTMENT_CODES)[number];

export interface StructuralBodyDTO {
    id?: string,
    memberId?: string,
    jabatan?: Jabatan,
    image?: Express.Multer.File | string,
    signatureImage?: Express.Multer.File | string,
    department?: string | null,
    isActive?: boolean
}