import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  generateCertificateAdvancedBuffer,
  generateCertificateService,
  getCertificatesService,
} from "./certificates.service";

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

  if (!code) {
    next(new ErrorApp("Certificate code is required", 400, MESSAGE_CODE.BAD_REQUEST));
    return;
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      code: code as string,
    },
    // Explicit selects: never load the full user row (it carries
    // the password hash) for a public verification endpoint.
    select: {
      code: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
      class: {
        select: {
          name: true,
          user: {
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

  const certificateData = {
    studentName: certificate.user.name,
    courseName: certificate.class.name,
    completionDate: new Date(certificate.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    certificateId: certificate.code,
    issuerName: "HIMTI UMT",
    instructorName: certificate.class.user.name,
    additionalText: `This certificate verifies the completion of all course requirements for "${certificate.class.name}".`,
  };

  const pdfBytes = await generateCertificateAdvancedBuffer(certificateData);
  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${certificateData.certificateId}.pdf"`
  );

  // Send the PDF
  res.send(Buffer.from(pdfBytes as Uint8Array));
};
