# 🗄️ Supabase Storage Backup & Restore Utility

Utility untuk backup dan restore semua file dari Supabase Storage bucket.

## 📋 Prerequisites

Pastikan dependencies sudah terinstall:

```bash
npm install @aws-sdk/client-s3 archiver adm-zip dotenv
```

## 🚀 Quick Start

### 1. Backup Storage

Untuk backup semua file dari Supabase storage ke ZIP file:

```bash
node backup-storage.js
```

**Output:**
- File ZIP dengan nama: `himti-storage-backup-YYYY-MM-DD.zip`
- Berisi semua file dengan struktur folder yang sama
- Temporary files akan otomatis dibersihkan setelah ZIP dibuat

**Contoh Output:**
```
╔════════════════════════════════════════════════════════════╗
║        🗄️  SUPABASE STORAGE BACKUP UTILITY 🗄️            ║
╚════════════════════════════════════════════════════════════╝

📝 Configuration:
   Endpoint: https://vivfqijtjlovgptrwica.supabase.co/storage/v1
   Bucket: himti
   Region: ap-southeast-1
   Folder: production

📋 Listing all objects in bucket...
✅ Found 150 files
📊 Total size: 245.67 MB

📥 Downloading files...
[1/150] ✅ production/event/bootcamp.webp (2.3 MB)
[2/150] ✅ production/user/photo-123.jpg (1.5 MB)
...

📦 Creating ZIP archive...
✅ ZIP created: himti-storage-backup-2024-01-15.zip
📊 Archive size: 240.12 MB

╔════════════════════════════════════════════════════════════╗
║                  ✅  BACKUP COMPLETE!  ✅                  ║
╚════════════════════════════════════════════════════════════╝

📦 Backup file: himti-storage-backup-2024-01-15.zip
📊 Files backed up: 150
⏱️  Time taken: 45.23s
```

---

### 2. Restore Storage

Untuk restore file dari backup ZIP ke Supabase storage:

```bash
node restore-storage.js <backup-zip-file>
```

**Example:**
```bash
node restore-storage.js himti-storage-backup-2024-01-15.zip
```

**Contoh Output:**
```
╔════════════════════════════════════════════════════════════╗
║        🔄  SUPABASE STORAGE RESTORE UTILITY 🔄            ║
╚════════════════════════════════════════════════════════════╝

📦 Extracting ZIP file: himti-storage-backup-2024-01-15.zip
✅ Found 150 files in ZIP

📤 Uploading files to Supabase storage...

[1/150] ✅ production/event/bootcamp.webp
[2/150] ✅ production/user/photo-123.jpg
...

╔════════════════════════════════════════════════════════════╗
║                  ✅  RESTORE COMPLETE!  ✅                 ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
   ✅ Uploaded: 150 files
   ❌ Failed: 0 files
   ⏭️  Skipped: 10 directories
```

---

## 📂 Folder Structure di Bucket

Script akan membackup semua folder yang ada di bucket `himti/production/`:

```
production/
├── attendance/          # File bukti kehadiran
├── event/              # Gambar event
├── event-registration/ # Bukti pembayaran/registrasi event
├── business/
│   ├── service/       # Gambar layanan business
│   └── merchandise/   # Gambar merchandise
├── user/              # Foto profil user
├── struktural/        # Foto struktural organisasi
├── class/             # Thumbnail kelas LMS
├── modules/           # File modul pembelajaran
├── assignments/       # File tugas
├── submission/        # File submission tugas
└── ticket-supports/   # File ticket support
```

---

## ⚙️ Configuration

Script menggunakan environment variables dari file `.env`:

```bash
AWS_STORAGE_BUCKET="himti"
AWS_STORAGE_ENDPOINT="https://vivfqijtjlovgptrwica.supabase.co/storage/v1"
AWS_STORAGE_REGION="ap-southeast-1"
AWS_STORAGE_ACCESS_KEY="your-access-key"
AWS_STORAGE_SECRET_KEY="your-secret-key"
AWS_STORAGE_BUCKET_FOLDER="production"
```

**Catatan:** Pastikan credentials sudah benar di file `.env`

---

## 🔧 Features

### Backup Script (`backup-storage.js`)

✅ **Fitur:**
- List semua file di bucket secara otomatis
- Download dengan progress indicator
- Maintain struktur folder original
- Compress ke ZIP dengan maximum compression
- Error handling untuk file yang gagal download
- Auto cleanup temporary files
- Summary report lengkap

✅ **Output:**
- Single ZIP file dengan timestamp
- Format: `himti-storage-backup-YYYY-MM-DD.zip`

### Restore Script (`restore-storage.js`)

✅ **Fitur:**
- Extract ZIP file otomatis
- Upload ke Supabase storage
- Auto-detect content type berdasarkan file extension
- Set ACL ke public-read
- Progress indicator
- Error handling
- Summary report

---

## 📊 Supported File Types

Script mendukung semua file types yang digunakan di aplikasi:

**Images:**
- `.jpg`, `.jpeg`, `.png`, `.webp`

**Documents:**
- `.pdf`, `.doc`, `.docx`, `.odt`

**Presentations:**
- `.ppt`, `.pptx`, `.odp`, `.key`

**Archives:**
- `.zip`, `.rar`

**Others:**
- Semua file type lainnya (as binary)

---

## ⚠️ Important Notes

### Backup

1. **Storage Space:** Pastikan ada cukup space di disk untuk download + ZIP
   - Jika bucket size = 250 MB, butuh ~500 MB space (download + ZIP)

2. **Network:** Backup memerlukan koneksi internet yang stabil
   - Download speed tergantung bandwidth

3. **Time:** Waktu backup tergantung jumlah dan size file
   - ~150 files (250 MB) ≈ 30-60 detik

4. **Temporary Files:** Dihapus otomatis setelah ZIP dibuat
   - Folder `storage-backup/` akan dibuat dan dihapus otomatis

### Restore

1. **Overwrite:** File existing akan di-overwrite
   - Gunakan dengan hati-hati di production

2. **Permissions:** File akan di-upload dengan ACL `public-read`
   - Sesuai dengan konfigurasi aplikasi

3. **Credentials:** Pastikan credentials punya write permission

---

## 🐛 Troubleshooting

### Error: "Missing AWS credentials"

**Solusi:**
```bash
# Pastikan .env file ada dan berisi:
AWS_STORAGE_ACCESS_KEY="..."
AWS_STORAGE_SECRET_KEY="..."
```

### Error: "Failed to list objects"

**Possible causes:**
1. Endpoint salah
2. Bucket name salah
3. Credentials tidak valid
4. Network issue

**Solusi:**
```bash
# Verify configuration
node -e "require('dotenv').config(); console.log(process.env.AWS_STORAGE_ENDPOINT)"
```

### Error: "Error downloading file"

**Solusi:**
- Check internet connection
- Retry backup
- Failed files akan di-skip, check error summary

### ZIP file terlalu besar

**Solusi:**
- Script menggunakan maximum compression (level 9)
- Jika masih terlalu besar, backup per folder:
  ```bash
  # Modify BUCKET_FOLDER in script
  AWS_STORAGE_BUCKET_FOLDER="production/event" node backup-storage.js
  ```

---

## 💡 Tips & Best Practices

### 1. Regular Backups

Setup cron job untuk backup otomatis:

```bash
# Backup setiap hari jam 2 pagi
0 2 * * * cd /path/to/project && node backup-storage.js
```

### 2. Backup Rotation

Keep multiple backups dengan rotation:

```bash
# Keep last 7 days
find . -name "himti-storage-backup-*.zip" -mtime +7 -delete
```

### 3. Remote Backup

Upload ZIP ke cloud storage:

```bash
# Example: Upload ke Google Drive, Dropbox, dll
node backup-storage.js && rclone copy himti-storage-backup-*.zip remote:backups/
```

### 4. Test Restore

Periodically test restore ke development environment:

```bash
# Test restore di dev
AWS_STORAGE_BUCKET="himti-dev" node restore-storage.js backup.zip
```

### 5. Monitor Size

Check bucket size before backup:

```bash
# Add to backup script to show initial size
```

---

## 📝 Example Workflow

### Complete Backup & Store

```bash
# 1. Backup
node backup-storage.js

# 2. Verify ZIP
unzip -l himti-storage-backup-*.zip | head -20

# 3. Upload to safe location
# (Google Drive, Dropbox, S3, etc)

# 4. Optional: Delete old local backups
find . -name "himti-storage-backup-*.zip" -mtime +7 -delete
```

### Disaster Recovery

```bash
# 1. Download backup ZIP
# (from Google Drive, Dropbox, etc)

# 2. Verify ZIP integrity
unzip -t himti-storage-backup-2024-01-15.zip

# 3. Restore to Supabase
node restore-storage.js himti-storage-backup-2024-01-15.zip

# 4. Verify in application
# Check if files are accessible
```

---

## 🔐 Security

### Credentials Safety

1. **Never commit credentials to git**
   ```bash
   # .env is in .gitignore
   ```

2. **Use environment-specific credentials**
   ```bash
   # Production
   AWS_STORAGE_ACCESS_KEY="prod-key"

   # Development
   AWS_STORAGE_ACCESS_KEY="dev-key"
   ```

3. **Rotate credentials regularly**
   - Update credentials setiap 90 hari
   - Update di .env file

### Backup File Safety

1. **Encrypt sensitive backups**
   ```bash
   # Encrypt ZIP file
   gpg -c himti-storage-backup-2024-01-15.zip
   ```

2. **Secure storage location**
   - Jangan simpan di public location
   - Use encrypted cloud storage

---

## 📞 Support

Jika ada masalah atau pertanyaan:

1. Check troubleshooting section
2. Verify configuration di .env
3. Check script console output untuk error details
4. Contact backend team

---

## 📜 Script Files

| File | Purpose | Size |
|------|---------|------|
| `backup-storage.js` | Backup utility | ~8 KB |
| `restore-storage.js` | Restore utility | ~5 KB |
| `STORAGE-BACKUP-README.md` | Documentation | This file |

---

## 🎯 Quick Reference

```bash
# Backup
node backup-storage.js

# Restore
node restore-storage.js <backup-file.zip>

# Check dependencies
npm list @aws-sdk/client-s3 archiver adm-zip

# Install dependencies
npm install @aws-sdk/client-s3 archiver adm-zip dotenv
```

---

**Last Updated:** January 15, 2024
**Version:** 1.0.0
**Maintained by:** HIMTI Development Team
