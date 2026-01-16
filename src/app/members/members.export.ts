import ExcelJS from "exceljs";
import { AnggotaModelTypes } from "./members.types";

// Format date to Indonesian format: "12 Januari 2025"
const formatDateIndonesian = (date: Date): string => {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const exportMembersToExcel = async (
  members: AnggotaModelTypes[],
  generationYear?: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Members Data");

  // Set column headers with styling
  worksheet.columns = [
    { header: "No", key: "no", width: 8 },
    { header: "NIM", key: "nim", width: 15 },
    { header: "Nama", key: "name", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Angkatan", key: "angkatan", width: 12 },
    { header: "Instagram", key: "instagram", width: 20 },
    { header: "Facebook", key: "facebook", width: 20 },
    { header: "LinkedIn", key: "linkedin", width: 20 },
    { header: "Twitter", key: "twitter", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF404040" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // Add data rows
  members.forEach((member, index) => {
    const row = worksheet.addRow({
      no: index + 1,
      nim: member.nim,
      name: member.name,
      email: member.email || "-",
      angkatan: member.angkatan?.year || "-",
      instagram: member.instagram || "-",
      facebook: member.facebook || "-",
      linkedin: member.linkedin || "-",
      twitter: member.twitter || "-",
      status: member.isActive ? "Active" : "Inactive",
      createdAt: formatDateIndonesian(new Date(member.createdAt)),
    });

    // Style data rows
    row.alignment = { vertical: "middle", horizontal: "left" };
    row.font = { size: 11 };

    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }

    // Color status cell
    const statusCell = row.getCell("status");
    if (member.isActive) {
      statusCell.font = { color: { argb: "FF006100" }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC6EFCE" },
      };
    } else {
      statusCell.font = { color: { argb: "FF9C0006" }, bold: true };
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFC7CE" },
      };
    }
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Add summary at the bottom
  const summaryRow = worksheet.addRow([]);
  summaryRow.getCell(1).value = "Total Members:";
  summaryRow.getCell(2).value = members.length;
  summaryRow.font = { bold: true, size: 12 };
  summaryRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFEB9C" },
  };

  const activeCount = members.filter((m) => m.isActive).length;
  const inactiveCount = members.length - activeCount;

  const activeRow = worksheet.addRow([]);
  activeRow.getCell(1).value = "Active Members:";
  activeRow.getCell(2).value = activeCount;
  activeRow.font = { bold: true };

  const inactiveRow = worksheet.addRow([]);
  inactiveRow.getCell(1).value = "Inactive Members:";
  inactiveRow.getCell(2).value = inactiveCount;
  inactiveRow.font = { bold: true };

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const generationFilter = generationYear ? `_${generationYear}` : "_All";
  const filename = `Members_Data${generationFilter}_${timestamp}.xlsx`;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    filename,
  };
};
