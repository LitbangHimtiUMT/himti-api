import { Category, Certificate, Class } from "@prisma/client";
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
    eligible: boolean;
    classCompleted: boolean;
    totalAssignments: number;
    approvedAssignments: number;
    assignments: AssignmentEligibility[];
}

// Shared by generate + eligibility so both endpoints apply exactly
// the same graduation rules. "not-found" and "forbidden" stay
// distinct from "ok" so callers can map them to 404/403 while "ok"
// carries the data; hasCertificate stays separate from `eligible`
// so generate can keep its duplicate-certificate error.
export type CertificateEligibilityResult =
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | ({ kind: "ok"; hasCertificate: boolean } & CertificateEligibilityDTO);