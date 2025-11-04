// /**
//  * Supabase Storage Backup Script
//  *
//  * This script will:
//  * 1. List all files in the Supabase storage bucket
//  * 2. Download all files maintaining folder structure
//  * 3. Create a ZIP archive for backup
//  *
//  * Usage: node backup-storage.js
//  */

// import dotenv from "dotenv";
// import path from "path";
// import fs from "fs";
// import { GetObjectCommand, ListObjectsV2Command, S3 } from "@aws-sdk/client-s3";
// import archiver from "archiver";

// // Load environment variables
// dotenv.config();

// // Configuration from .env
// const config = {
//   bucket: process.env.AWS_STORAGE_BUCKET || "himti",
//   endpoint: process.env.AWS_STORAGE_ENDPOINT || "",
//   region: process.env.AWS_STORAGE_REGION || "ap-southeast-1",
//   accessKeyId: process.env.AWS_STORAGE_ACCESS_KEY || "",
//   secretAccessKey: process.env.AWS_STORAGE_SECRET_KEY || "",
//   bucketFolder: process.env.AWS_STORAGE_BUCKET_FOLDER || "production",
// };

// // Initialize S3 Client
// const s3Client = new S3({
//   forcePathStyle: true,
//   endpoint: `${config.endpoint}/s3`,
//   credentials: {
//     accessKeyId: config.accessKeyId,
//     secretAccessKey: config.secretAccessKey,
//   },
//   region: config.region,
// });

// // Create backup directory
// const backupDir = path.join(__dirname, "storage-backup");
// const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
// const zipFileName = `himti-storage-backup-${timestamp}.zip`;

// // Ensure backup directory exists
// if (!fs.existsSync(backupDir)) {
//   fs.mkdirSync(backupDir, { recursive: true });
// }

// /**
//  * List all objects in the bucket
//  */
// async function listAllObjects() {
//   console.log("\n📋 Listing all objects in bucket...");
//   console.log(`   Bucket: ${config.bucket}`);
//   console.log(`   Folder: ${config.bucketFolder}`);

//   const objects = [];
//   let continuationToken: string | undefined = undefined;
//   let totalSize = 0;

//   try {
//     do {
//       const command = new ListObjectsV2Command({
//         Bucket: config.bucket,
//         Prefix: config.bucketFolder + "/",
//         ContinuationToken: continuationToken,
//       });

//       const response = await s3Client.send(command);
//       if (response.Contents) {
//         for (const obj of response.Contents) {
//           if (obj.Key && obj.Size && obj.Size > 0) {
//             objects.push({
//               key: obj.Key,
//               size: obj.Size,
//               lastModified: obj.LastModified,
//             });
//             totalSize += obj.Size;
//           }
//         }
//       }

//       continuationToken = response.NextContinuationToken;
//     } while (continuationToken);

//     console.log(`\n✅ Found ${objects.length} files`);
//     console.log(`📊 Total size: ${formatBytes(totalSize)}`);

//     return objects;
//   } catch (error) {
//     console.error("❌ Error listing objects:", error.message);
//     throw error;
//   }
// }

// /**
//  * Download a single file from S3
//  */
// async function downloadFile(key: string) {
//   try {
//     const command = new GetObjectCommand({
//       Bucket: config.bucket,
//       Key: key,
//     });

//     const response = await s3Client.send(command);

//     // Convert stream to buffer
//     const chunks: Buffer[] = [];
//     if (response?.Body) {
//       for await (const chunk of response?.Body) {
//         chunks.push(chunk);
//       }
//     }

//     return Buffer.concat(chunks);
//   } catch (error) {
//     console.error(`❌ Error downloading ${key}:`, error.message);
//     throw error;
//   }
// }

// /**
//  * Download all files and save to local directory
//  */
// async function downloadAllFiles(objects) {
//   console.log("\n📥 Downloading files...");

//   let downloaded = 0;
//   let failed = 0;
//   const errors: Array<> = [];

//   for (let i = 0; i < objects.length; i++) {
//     const obj = objects[i];
//     const progress = `[${i + 1}/${objects.length}]`;

//     try {
//       // Download file
//       const buffer = await downloadFile(obj.key);

//       // Create local file path
//       const localPath = path.join(backupDir, obj.key);
//       const localDir = path.dirname(localPath);

//       // Create directory if not exists
//       if (!fs.existsSync(localDir)) {
//         fs.mkdirSync(localDir, { recursive: true });
//       }

//       // Write file
//       fs.writeFileSync(localPath, buffer);

//       downloaded++;
//       console.log(`${progress} ✅ ${obj.key} (${formatBytes(obj.size)})`);
//     } catch (error) {
//       failed++;
//       errors.push({ key: obj.key, error: error.message });
//       console.log(`${progress} ❌ ${obj.key} - ${error.message}`);
//     }
//   }

//   console.log(`\n📊 Download Summary:`);
//   console.log(`   ✅ Downloaded: ${downloaded} files`);
//   console.log(`   ❌ Failed: ${failed} files`);

//   if (errors.length > 0) {
//     console.log(`\n❌ Errors:`);
//     errors.forEach(({ key, error }) => {
//       console.log(`   - ${key}: ${error}`);
//     });
//   }

//   return { downloaded, failed, errors };
// }

// /**
//  * Create ZIP archive from downloaded files
//  */
// async function createZipArchive() {
//   console.log("\n📦 Creating ZIP archive...");

//   return new Promise((resolve, reject) => {
//     const zipPath = path.join(__dirname, zipFileName);
//     const output = fs.createWriteStream(zipPath);
//     const archive = archiver("zip", {
//       zlib: { level: 9 }, // Maximum compression
//     });

//     output.on("close", () => {
//       const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
//       console.log(`✅ ZIP created: ${zipFileName}`);
//       console.log(`📊 Archive size: ${sizeInMB} MB`);
//       resolve(zipPath);
//     });

//     archive.on("error", (err) => {
//       console.error("❌ Error creating ZIP:", err);
//       reject(err);
//     });

//     archive.on("warning", (err) => {
//       if (err.code === "ENOENT") {
//         console.warn("⚠️  Warning:", err);
//       } else {
//         reject(err);
//       }
//     });

//     archive.pipe(output as unknown as NodeJS.WritableStream);

//     // Add all files from backup directory
//     archive.directory(backupDir, false);

//     archive.finalize();
//   });
// }

// /**
//  * Clean up temporary backup directory
//  */
// function cleanupTempDirectory() {
//   console.log("\n🧹 Cleaning up temporary files...");

//   try {
//     fs.rmSync(backupDir, { recursive: true, force: true });
//     console.log("✅ Temporary files cleaned up");
//   } catch (error) {
//     console.error("❌ Error cleaning up:", error.message);
//   }
// }

// /**
//  * Format bytes to human readable format
//  */
// function formatBytes(bytes, decimals = 2) {
//   if (bytes === 0) return "0 Bytes";

//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// }

// /**
//  * Main execution function
//  */
// async function main() {
//   console.log("╔════════════════════════════════════════════════════════════╗");
//   console.log("║                                                            ║");
//   console.log("║        🗄️  SUPABASE STORAGE BACKUP UTILITY 🗄️            ║");
//   console.log("║                                                            ║");
//   console.log("╚════════════════════════════════════════════════════════════╝");

//   const startTime = Date.now();

//   try {
//     // Validate configuration
//     if (!config.accessKeyId || !config.secretAccessKey) {
//       throw new Error("Missing AWS credentials in .env file");
//     }

//     if (!config.endpoint) {
//       throw new Error("Missing AWS_STORAGE_ENDPOINT in .env file");
//     }

//     console.log("\n📝 Configuration:");
//     console.log(`   Endpoint: ${config.endpoint}`);
//     console.log(`   Bucket: ${config.bucket}`);
//     console.log(`   Region: ${config.region}`);
//     console.log(`   Folder: ${config.bucketFolder}`);

//     // Step 1: List all objects
//     const objects = await listAllObjects();

//     if (objects.length === 0) {
//       console.log("\n⚠️  No files found in bucket. Backup not needed.");
//       return;
//     }

//     // Step 2: Download all files
//     const result = await downloadAllFiles(objects);

//     if (result.downloaded === 0) {
//       console.log("\n❌ No files were downloaded. Aborting backup.");
//       cleanupTempDirectory();
//       return;
//     }

//     // Step 3: Create ZIP archive
//     const zipPath = await createZipArchive();

//     // Step 4: Cleanup temporary directory
//     cleanupTempDirectory();

//     // Summary
//     const duration = ((Date.now() - startTime) / 1000).toFixed(2);

//     console.log(
//       "\n╔════════════════════════════════════════════════════════════╗"
//     );
//     console.log(
//       "║                                                            ║"
//     );
//     console.log(
//       "║                  ✅  BACKUP COMPLETE!  ✅                  ║"
//     );
//     console.log(
//       "║                                                            ║"
//     );
//     console.log(
//       "╚════════════════════════════════════════════════════════════╝"
//     );
//     console.log(`\n📦 Backup file: ${zipFileName}`);
//     console.log(`📊 Files backed up: ${result.downloaded}`);
//     console.log(`⏱️  Time taken: ${duration}s`);
//     console.log(
//       `\n💡 Tip: You can now safely store or transfer this ZIP file.`
//     );
//   } catch (error) {
//     console.error("\n❌ Backup failed:", error.message);
//     console.error(error);
//     cleanupTempDirectory();
//     process.exit(1);
//   }
// }

// // Run the backup
// main();
