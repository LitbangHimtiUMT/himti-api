# 🚀 Storage Backup - Quick Reference Card

## ⚡ One-Line Commands

```bash
# 1. Test connection
node test-connection.js

# 2. Full backup
node backup-storage.js

# 3. Restore from backup
node restore-storage.js himti-storage-backup-2024-01-15.zip

# 4. Check backup contents
unzip -l himti-storage-backup-*.zip | head -20
```

---

## 📦 Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `backup-storage.js` | Full backup to ZIP | Daily/Weekly backup |
| `restore-storage.js` | Restore from ZIP | Disaster recovery |
| `test-connection.js` | Test credentials | Before first use |

---

## 🎯 Common Scenarios

### Scenario 1: First Time Backup
```bash
# Step 1: Test connection
node test-connection.js

# Step 2: Run backup
node backup-storage.js

# Output: himti-storage-backup-2024-01-15.zip
```

### Scenario 2: Regular Backup
```bash
# Just run backup
node backup-storage.js

# Store ZIP safely
```

### Scenario 3: Disaster Recovery
```bash
# Restore from latest backup
node restore-storage.js himti-storage-backup-2024-01-15.zip
```

---

## 📊 Expected Output

### Backup Success:
```
✅ Found 150 files
📊 Total size: 245.67 MB
...
✅ BACKUP COMPLETE!
📦 Backup file: himti-storage-backup-2024-01-15.zip
```

### Restore Success:
```
✅ Found 150 files in ZIP
...
✅ RESTORE COMPLETE!
📊 Uploaded: 150 files
```

---

## ⚠️ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing credentials" | Check `.env` file |
| "Connection failed" | Run `node test-connection.js` |
| "No space left" | Free up disk space |
| Slow download | Check internet speed |

---

## 💾 Storage Requirements

- Bucket size: ~250 MB
- ZIP file: ~240 MB (compressed)
- Temp files: ~250 MB (auto-deleted)
- **Total needed: ~500 MB free space**

---

## 🔐 Configuration (.env)

```bash
AWS_STORAGE_BUCKET="himti"
AWS_STORAGE_ENDPOINT="https://vivfqijtjlovgptrwica.supabase.co/storage/v1"
AWS_STORAGE_REGION="ap-southeast-1"
AWS_STORAGE_ACCESS_KEY="your-key"
AWS_STORAGE_SECRET_KEY="your-secret"
AWS_STORAGE_BUCKET_FOLDER="production"
```

---

## 📅 Recommended Schedule

```bash
# Daily backup (2 AM)
0 2 * * * cd /path/to/project && node backup-storage.js

# Keep last 7 days
find . -name "himti-storage-backup-*.zip" -mtime +7 -delete
```

---

## 📖 Full Documentation

Read `STORAGE-BACKUP-README.md` for:
- Detailed usage instructions
- Advanced features
- Best practices
- Complete troubleshooting guide

---

**Quick Help:** `cat BACKUP-QUICK-REFERENCE.md`
