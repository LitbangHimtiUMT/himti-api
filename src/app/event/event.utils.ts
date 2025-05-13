import archiver from "archiver";
import { createCanvas, loadImage } from "canvas";
import { Response } from "express";
// import path from "path";
import PDFDocument from "pdfkit";
import { Stream } from "stream";

export const generateMultipleCertificate = async (
  res: Response,
  data: string[],
  template: Buffer
) => {
  // Persiapkan ZIP archive
  const archive = archiver("zip", { zlib: { level: 9 } });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="certificates.zip"'
  );
  archive.pipe(res);

  // const template = await loadImage(templatePath);
  const tmp = template;

  for (const name of data) {
    const template = await loadImage(tmp);
    const canvas = createCanvas(3508, 2480);
    const ctx = canvas.getContext("2d");

    // Gambar background
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // Atur font
    ctx.font = "bold 180px Times New Roman";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2.5);

    // Buat PDF dari canvas
    const bufferStream = new Stream.PassThrough();
    const doc = new PDFDocument({
      size: [canvas.width, canvas.height],
      margin: 0,
    });
    doc.pipe(bufferStream);

    const imageData = canvas.toBuffer("image/png");
    doc.image(imageData, 0, 0, { width: canvas.width, height: canvas.height });
    doc.end();

    // const pdfBuffer = await new Promise<Buffer>((resolve) => {
    //   const chunks: any[] = [];
    //   bufferStream.on("data", (chunk) => chunks.push(chunk));
    //   bufferStream.on("end", () => resolve(Buffer.concat(chunks)));
    //   doc.pipe(bufferStream); // ❌ Ini menyebabkan duplikasi stream pipe
    // });

    // // Tambahkan ke ZIP
    // archive.append(pdfBuffer, { name: `${name.replace(/ /g, "_")}.pdf` });

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: [canvas.width, canvas.height],
        margin: 0,
      });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.on("end", () => resolve(Buffer.concat(chunks as any)));

      const imageData = canvas.toBuffer("image/png");
      doc.image(imageData, 0, 0, {
        width: canvas.width,
        height: canvas.height,
      });
      doc.end();
    });

    archive.append(pdfBuffer, { name: `${name.replace(/ /g, "_")}.pdf` });
  }

  // Finalisasi ZIP
  archive.finalize();
};
