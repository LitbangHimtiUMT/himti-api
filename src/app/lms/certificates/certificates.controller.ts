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
  next
  // const certificateData = {
  //   studentName: req.body.studentName || 'John Doe',
  //   courseName: req.body.courseName || 'Advanced TypeScript',
  //   completionDate: req.body.completionDate || new Date().toLocaleDateString(),
  //   certificateId: req.body.certificateId || `CERT-${Date.now()}`,
  //   issuerName: req.body.issuerName,
  //   additionalText: req.body.additionalText,
  // };
  const certificateData = {
    studentName: "Jane Doe",
    courseName: "Advanced Web Development",
    completionDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    certificateId: `CERT-${Date.now()}`,
    issuerName: "Tech Education Institute",
    hoursCompleted: 120,
    instructorName: "Dr. John Smith",
    additionalText:
      "This certificate verifies the completion of all course requirements and final project assessment.",
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
