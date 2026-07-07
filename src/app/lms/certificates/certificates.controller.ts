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
  const { code, id } = req.query;

  if (!code && !id) {
    next(new ErrorApp("Certificate code or ID is required", 400, MESSAGE_CODE.BAD_REQUEST));
    return;
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        ...(id ? [{ id: id as string }] : []),
        ...(code ? [{ code: code as string }] : []),
      ]
    },
    include: {
      user: true,
      class: {
        include: {
          user: true,
        }
      }
    }
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
