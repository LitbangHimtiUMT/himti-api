/**
 * Supabase Storage Restore Script
 *
 * This script will restore files from a backup ZIP to Supabase storage
 *
 * Usage: node restore-storage.js <backup-zip-file>
 * Example: node restore-storage.js himti-storage-backup-2024-01-15.zip
 */

import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
// Load environment variables
dotenv.config();

// Configuration
const config = {
  bucket: process.env.AWS_STORAGE_BUCKET || "himti",
  endpoint: process.env.AWS_STORAGE_ENDPOINT || "",
  region: process.env.AWS_STORAGE_REGION || "ap-southeast-1",
  accessKeyId: process.env.AWS_STORAGE_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_STORAGE_SECRET_KEY || "",
};

// Initialize S3 Client
const s3Client = new S3({
  forcePathStyle: true,
  endpoint: `${config.endpoint}/s3`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  region: config.region,
});

/**
 * Upload a file to S3
 */
async function uploadFile(
  key,
  buffer,
  contentType = "application/octet-stream"
) {
  try {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${key}:`, error.message);
    return false;
  }
}

/**
 * Get content type from file extension
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
  };

  return types[ext] || "application/octet-stream";
}

/**
 * Main restore function
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                                                            ║");
  console.log("║        🔄  SUPABASE STORAGE RESTORE UTILITY 🔄            ║");
  console.log("║                                                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // Get ZIP file from command line argument
  const zipFilePath = process.argv[2];

  if (!zipFilePath) {
    console.error("\n❌ Error: Please provide a ZIP file path");
    console.log("\n📝 Usage: node restore-storage.js <backup-zip-file>");
    console.log(
      "   Example: node restore-storage.js himti-storage-backup-2024-01-15.zip"
    );
    process.exit(1);
  }

  if (!fs.existsSync(zipFilePath)) {
    console.error(`\n❌ Error: File not found: ${zipFilePath}`);
    process.exit(1);
  }

  console.log(`\n📦 Extracting ZIP file: ${path.basename(zipFilePath)}`);

  try {
    // Extract ZIP
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    console.log(`✅ Found ${zipEntries.length} files in ZIP`);

    let uploaded = 0;
    let failed = 0;
    let skipped = 0;

    console.log("\n📤 Uploading files to Supabase storage...\n");

    for (let i = 0; i < zipEntries.length; i++) {
      const entry = zipEntries[i];
      const progress = `[${i + 1}/${zipEntries.length}]`;

      if (entry.isDirectory) {
        skipped++;
        continue;
      }

      const key = entry.entryName;
      const buffer = entry.getData();
      const contentType = getContentType(entry.name);

      const success = await uploadFile(key, buffer, contentType);

      if (success) {
        uploaded++;
        console.log(`${progress} ✅ ${key}`);
      } else {
        failed++;
        console.log(`${progress} ❌ ${key}`);
      }
    }

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║                                                            ║"
    );
    console.log(
      "║                  ✅  RESTORE COMPLETE!  ✅                 ║"
    );
    console.log(
      "║                                                            ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Uploaded: ${uploaded} files`);
    console.log(`   ❌ Failed: ${failed} files`);
    console.log(`   ⏭️  Skipped: ${skipped} directories`);
  } catch (error) {
    console.error("\n❌ Restore failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the restore
main();
