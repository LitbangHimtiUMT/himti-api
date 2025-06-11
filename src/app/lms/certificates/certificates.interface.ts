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