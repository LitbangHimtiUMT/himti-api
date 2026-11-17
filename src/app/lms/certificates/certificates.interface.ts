import { Category, Certificate, CertificateRole, Class } from "@prisma/client";
import { Query } from "../../../interface/Query";

export interface CertificateQuery extends Query {
    classId?: string
}

export interface CertificateData extends Certificate {
    class: Class & {
        category: Category
    }
}

export type AssignmentEligibilityStatus = "APPROVED" | "REVIEW" | "REJECT" | "NONE";

export interface AssignmentEligibility {
    id: string;
    title: string;
    moduleId: string;
    moduleName: string;
    status: AssignmentEligibilityStatus;
}

export interface CertificateEligibilityDTO {
    // Role path the server assigned the caller: a class mentor
    // (creator or co-mentor) claims as PEMATERI, a participant as
    // PESERTA. Never read from client input — the service decides
    // it from the token identity. The LMS branches its rendering
    // on this field (no assignment meter for the mentor path).
    role: CertificateRole;
    eligible: boolean;
    classCompleted: boolean;
    totalAssignments: number;
    approvedAssignments: number;
    assignments: AssignmentEligibility[];
    hasCertificate: boolean;
    // Code of the caller's existing certificate in this class, for
    // the View link; null when they have none yet.
    certificateCode: string | null;
}

// Shared by generate + eligibility so both endpoints apply exactly
// the same graduation rules. "not-found" and "forbidden" stay
// distinct from "ok" so callers can map them to 404/403 while "ok"
// carries the data; hasCertificate stays separate from `eligible`
// so generate can keep its duplicate-certificate error.
export type CertificateEligibilityResult =
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | ({ kind: "ok" } & CertificateEligibilityDTO);