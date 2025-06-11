import { CertificateData } from "./certificates.interface";

export const getCertificatesMapper = (data: CertificateData[]) => {
    return data.map(item => ({
        id: item.id,
        code: item.code,
        class: {
            id: item.class.id,
            name: item.class.name,
            category: {
                id: item.class.category.id,
                name: item.class.category.name
            }
        },
        createdAt: item.createdAt
    }))
}