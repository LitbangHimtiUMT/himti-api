/**
 * Test Supabase Storage Connection
 * Quick test to verify credentials and connection
 */

import { ListObjectsV2Command, S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const config = {
  bucket: process.env.AWS_STORAGE_BUCKET || "himti",
  endpoint: process.env.AWS_STORAGE_ENDPOINT || "",
  region: process.env.AWS_STORAGE_REGION || "ap-southeast-1",
  accessKeyId: process.env.AWS_STORAGE_ACCESS_KEY || "",
  secretAccessKey: process.env.AWS_STORAGE_SECRET_KEY || "",
  bucketFolder: process.env.AWS_STORAGE_BUCKET_FOLDER || "production",
};

console.log("🔍 Testing Supabase Storage Connection...\n");
console.log("📝 Configuration:");
console.log(`   Endpoint: ${config.endpoint}`);
console.log(`   Bucket: ${config.bucket}`);
console.log(`   Region: ${config.region}`);
console.log(`   Folder: ${config.bucketFolder}`);
console.log(`   Access Key: ${config.accessKeyId.substring(0, 8)}...`);

const s3Client = new S3({
  forcePathStyle: true,
  endpoint: `${config.endpoint}/s3`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  region: config.region,
});

async function testConnection() {
  try {
    console.log("\n🔌 Connecting to Supabase Storage...");

    const command = new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: config.bucketFolder + "/",
      MaxKeys: 10, // Only get first 10 to test
    });

    const response = await s3Client.send(command);

    console.log("✅ Connection successful!\n");
    console.log("📊 Sample files:");

    if (response.Contents && response.Contents.length > 0) {
      response.Contents.forEach((obj, index) => {
        const sizeKB = ((obj.Size || 0) / 1024).toFixed(2);
        console.log(`   ${index + 1}. ${obj.Key} (${sizeKB} KB)`);
      });
      console.log(`\n✅ Found ${response.KeyCount} files in first batch`);
      console.log(`📦 Ready to run backup!`);
      console.log(`\n💡 Run: node backup-storage.js`);
    } else {
      console.log("   ⚠️  No files found in bucket");
    }
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);

    if (error.Code === "NoSuchBucket") {
      console.error("\n💡 Bucket does not exist or incorrect name");
    } else if (error.Code === "InvalidAccessKeyId") {
      console.error("\n💡 Access key is invalid");
    } else if (error.Code === "SignatureDoesNotMatch") {
      console.error("\n💡 Secret key is invalid");
    } else {
      console.error("\n💡 Check your credentials in .env file");
    }

    process.exit(1);
  }
}

testConnection();
