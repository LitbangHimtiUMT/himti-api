import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  generateCertificateService,
  getCertificateEligibilityService,
  getCertificatesService,
} from "./certificates.service";
import {
  CertificateSignersSnapshot,
  parseSignersSnapshot,
  resolveActiveSigners,
} from "./certificate-signers";
import { renderCertificatePdf } from "./certificate-template";

import { prisma } from "../../../config";

export const generateCertificateController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { classId } = params;

  const result = await generateCertificateService(classId, userId ?? "");
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CERTIFICATE.GENERATE,
    result
  );
};

export const getCertificateEligibilityController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { classId } = params;

  const result = await getCertificateEligibilityService(
    classId,
    userId ?? ""
  );
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CERTIFICATE.ELIGIBILITY,
    result
  );
};

export const getCertificatesController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId, query } = req;
  const result = await getCertificatesService(query, userId ?? "");
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CERTIFICATE.GET,
    result.data,
    result.meta
  );
};

export const getFileCertificateController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  // By-code only: the old by-id lookup let anyone enumerate
  // certificate ids and download other students' certificates.
  // The code is the unguessable verification token printed on the
  // certificate itself, so this stays public for verification.
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    next(new ErrorApp("Certificate code is required", 400, MESSAGE_CODE.BAD_REQUEST));
    return;
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      code,
    },
    // Explicit selects: never load the full user row (it carries
    // the password hash) for a public verification endpoint.
    select: {
      code: true,
      role: true,
      formalNumber: true,
      signers: true,
      user: {
        select: {
          name: true,
        },
      },
      class: {
        select: {
          name: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    next(new ErrorApp("Certificate not found", 404, MESSAGE_CODE.NOT_FOUND));
    return;
  }

  // Render from the snapshot frozen at claim time: a leadership
  // rotation must not rewrite an issued certificate. Certificates
  // issued before snapshots existed fall back to the live signer
  // rows and print no formal-number row; if even the live rows are
  // incomplete, the blocks render with names blank rather than
  // breaking verification of an already-issued certificate.
  let signers: CertificateSignersSnapshot | null = parseSignersSnapshot(
    certificate.signers
  );
  let formalNumber: string | null = certificate.formalNumber;
  if (!signers) {
    formalNumber = null;
    signers =
      (await resolveActiveSigners(prisma)) ??
      {
        psdm: { name: "", signatureImage: null },
        kahim: { name: "", signatureImage: null },
        kaprodi: { name: "", signatureImage: null },
      };
  }

  const pdfBytes = await renderCertificatePdf({
    recipientName: certificate.user.name,
    className: certificate.class.name,
    categoryName: certificate.class.category.name,
    role: certificate.role,
    formalNumber,
    verificationCode: certificate.code,
    signers,
  });
  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${certificate.code}.pdf"`
  );

  // Send the PDF
  res.send(Buffer.from(pdfBytes as Uint8Array));
};
