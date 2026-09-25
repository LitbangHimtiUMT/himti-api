/* eslint-disable */
// One-time script: modifies ABSENSI.docx to add docx-templates tokens.
// Run: node scripts/prepare-absensi-template.js
// It reads ABSENSI.docx, produces ABSENSI.template.docx (with tokens).
// Idempotent: if the token is already present, it will re-generate from scratch by
// re-running against the original ABSENSI.docx.

const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "ABSENSI.docx");
const OUT = path.join(__dirname, "..", "ABSENSI.template.docx");

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Source template not found:", SRC);
    process.exit(1);
  }

  const zip = new AdmZip(SRC);
  const entry = zip.getEntry("word/document.xml");
  if (!entry) {
    console.error("word/document.xml not found in ABSENSI.docx");
    process.exit(1);
  }

  let xml = entry.getData().toString("utf8");

  // ---------- 1) Replace the title text runs ----------
  // Title text in source is split across 3 <w:t> runs: "ABSENSI ACARA {", "Judul", " Acara}"
  // We collapse them into a single run text: "ABSENSI ACARA {INS eventTitle}"
  // We'll locate the paragraph containing "ABSENSI ACARA" and rewrite its <w:r>...</w:r> chain to a single run,
  // preserving one run's rPr for formatting.
  const titleParaRegex = /(<w:p\b[^>]*>)([\s\S]*?ABSENSI ACARA[\s\S]*?)(<\/w:p>)/;
  const m = xml.match(titleParaRegex);
  if (!m) {
    console.error("Title paragraph not found");
    process.exit(1);
  }

  const titlePOpen = m[1];
  const titleInner = m[2];
  const titlePClose = m[3];

  // Extract first <w:rPr>...</w:rPr> found inside a run to reuse formatting
  const rprMatch = titleInner.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
  const rpr = rprMatch ? rprMatch[0] : "";
  // Preserve paragraph pPr if present
  const pprMatch = titleInner.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const ppr = pprMatch ? pprMatch[0] : "";

  const newTitleInner =
    ppr +
    `<w:r>${rpr}<w:t xml:space="preserve">ABSENSI ACARA {INS eventTitle}</w:t></w:r>`;
  xml = xml.replace(
    titleParaRegex,
    `${titlePOpen}${newTitleInner}${titlePClose}`
  );

  // ---------- 2) Rebuild the table ----------
  const tblRegex = /<w:tbl>[\s\S]*?<\/w:tbl>/;
  const tblMatch = xml.match(tblRegex);
  if (!tblMatch) {
    console.error("Table not found");
    process.exit(1);
  }
  const originalTable = tblMatch[0];

  // Extract <w:tblPr>, <w:tblGrid> to keep table layout untouched
  const tblPrMatch = originalTable.match(/<w:tblPr>[\s\S]*?<\/w:tblPr>/);
  const tblGridMatch = originalTable.match(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/);
  const tblPr = tblPrMatch ? tblPrMatch[0] : "";
  const tblGrid = tblGridMatch ? tblGridMatch[0] : "";

  // Extract all rows
  const rows = [...originalTable.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map(
    (r) => r[0]
  );
  if (rows.length < 2) {
    console.error("Expected at least 2 rows (header + 1 data), got", rows.length);
    process.exit(1);
  }
  const headerRow = rows[0];
  const templateDataRow = rows[1];

  // Modify header row: replace 3rd cell text ("Angkatan") with {INS $columnHeader}
  // Cells are <w:tc>...</w:tc>. Extract cells:
  const headerCells = [
    ...headerRow.matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g),
  ].map((m) => m[0]);
  if (headerCells.length < 4) {
    console.error("Header row cell count unexpected:", headerCells.length);
    process.exit(1);
  }
  // Rewrite cell #2 (Angkatan) text to token, preserving structure.
  headerCells[2] = replaceCellTextTokens(headerCells[2], "{INS columnHeader}");

  // Rebuild header row
  const headerTrOpenMatch = headerRow.match(/<w:tr\b[^>]*>/);
  const headerTrOpen = headerTrOpenMatch ? headerTrOpenMatch[0] : "<w:tr>";
  const newHeaderRow = `${headerTrOpen}${headerCells.join("")}</w:tr>`;

  // For the data template row, set each cell text to a token.
  // Data row cells order: [No] [Nama Lengkap] [Angkatan/Detail] [Ttd]
  const dataCells = [
    ...templateDataRow.matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g),
  ].map((m) => m[0]);
  if (dataCells.length < 4) {
    console.error("Data row cell count unexpected:", dataCells.length);
    process.exit(1);
  }
  dataCells[0] = replaceCellTextTokens(dataCells[0], "{INS $row.no}");
  dataCells[1] = replaceCellTextTokens(dataCells[1], "{INS $row.name}");
  dataCells[2] = replaceCellTextTokens(dataCells[2], "{INS $row.detail}");
  dataCells[3] = replaceCellTextTokens(dataCells[3], "{INS $row.ttd}");

  const dataTrOpenMatch = templateDataRow.match(/<w:tr\b[^>]*>/);
  const dataTrOpen = dataTrOpenMatch ? dataTrOpenMatch[0] : "<w:tr>";
  const newDataRow = `${dataTrOpen}${dataCells.join("")}</w:tr>`;

  // Row-level loop: create a "FOR" command row and "END-FOR" command row that
  // wrap the single data row. docx-templates repeats every row/paragraph BETWEEN
  // the command rows, and it removes the command rows themselves.
  //
  // The command rows re-use the same row skeleton as the data row (same cells /
  // widths) but each cell paragraph is emptied except that the first cell of the
  // FOR row contains the FOR command text, and the first cell of the END-FOR row
  // contains the END-FOR command text.
  const forRowCells = dataCells.slice();
  forRowCells[0] = replaceCellTextTokens(forRowCells[0], "{FOR row IN rows}");
  forRowCells[1] = replaceCellTextTokens(forRowCells[1], "");
  forRowCells[2] = replaceCellTextTokens(forRowCells[2], "");
  forRowCells[3] = replaceCellTextTokens(forRowCells[3], "");
  const forCmdRow = `${dataTrOpen}${forRowCells.join("")}</w:tr>`;

  const endRowCells = dataCells.slice();
  endRowCells[0] = replaceCellTextTokens(endRowCells[0], "{END-FOR row}");
  endRowCells[1] = replaceCellTextTokens(endRowCells[1], "");
  endRowCells[2] = replaceCellTextTokens(endRowCells[2], "");
  endRowCells[3] = replaceCellTextTokens(endRowCells[3], "");
  const endCmdRow = `${dataTrOpen}${endRowCells.join("")}</w:tr>`;

  // Rebuild the table: tblPr + tblGrid + header + FOR + data + END-FOR
  const newTable = `<w:tbl>${tblPr}${tblGrid}${newHeaderRow}${forCmdRow}${newDataRow}${endCmdRow}</w:tbl>`;
  xml = xml.replace(tblRegex, newTable);

  // Save into the zip and write out
  zip.updateFile("word/document.xml", Buffer.from(xml, "utf8"));
  zip.writeZip(OUT);
  console.log("Wrote template with tokens ->", OUT);
}

// Replace all <w:t>...</w:t> content in a cell with a single <w:t> containing
// the token, preserving the first <w:rPr> style. It also NORMALIZES paragraph
// alignment: any existing <w:jc> is stripped and a fixed <w:jc w:val="left"/>
// is injected inside <w:pPr>. This is required because the original ABSENSI.docx
// has an inconsistent alignment on the Ttd column (even rows are center-aligned,
// odd rows are default/left) which caused a visible "zig-zag" effect on the
// numbering column after row duplication.
function replaceCellTextTokens(cellXml, tokenText) {
  const paraMatch = cellXml.match(/<w:p\b[\s\S]*?<\/w:p>/);
  if (!paraMatch) return cellXml;
  const paraXml = paraMatch[0];

  const pPrMatch = paraXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  let pPr = pPrMatch ? pPrMatch[0] : "";
  pPr = normalizeParagraphAlignment(pPr);

  const rPrMatch = paraXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
  const rPr = rPrMatch ? rPrMatch[0] : "";

  const pOpenMatch = paraXml.match(/<w:p\b[^>]*>/);
  const pOpen = pOpenMatch ? pOpenMatch[0] : "<w:p>";

  const newPara = `${pOpen}${pPr}<w:r>${rPr}<w:t xml:space="preserve">${tokenText}</w:t></w:r></w:p>`;
  return cellXml.replace(/<w:p\b[\s\S]*?<\/w:p>/, newPara);
}

// Force paragraph alignment to "left" in a <w:pPr> block.
// - If a <w:jc> element exists, replace its w:val with "left".
// - If <w:pPr> exists but has no <w:jc>, insert one at the start.
// - If no <w:pPr>, create a new one with just the jc element.
function normalizeParagraphAlignment(pPr) {
  const jcElement = '<w:jc w:val="left"/>';
  if (!pPr) {
    return `<w:pPr>${jcElement}</w:pPr>`;
  }
  if (/<w:jc\b[^/]*\/>/.test(pPr)) {
    return pPr.replace(/<w:jc\b[^/]*\/>/, jcElement);
  }
  // Insert jc right after <w:pPr> opening tag
  return pPr.replace(/<w:pPr>/, `<w:pPr>${jcElement}`);
}

// Prepend text inside the <w:t> that currently contains a token (e.g., before {INS ...})
function injectBeforeToken(cellXml, prefixText) {
  return cellXml.replace(
    /(<w:t xml:space="preserve">)(\{INS[^}]*\})/,
    (_, open, token) => `${open}${escapeXml(prefixText)}${token}`
  );
}

function injectAfterToken(cellXml, suffixText) {
  return cellXml.replace(
    /(\{INS[^}]*\})(<\/w:t>)/,
    (_, token, close) => `${token}${escapeXml(suffixText)}${close}`
  );
}

main();