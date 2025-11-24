# GitHub Actions - Discord Notifications

Dokumentasi untuk GitHub Actions yang mengirim notifikasi Discord untuk deployment Vercel.

## 🎯 Fitur

GitHub Actions ini akan mengirim 3 jenis notifikasi ke Discord:

1. **📝 Push Notification** - Setiap kali ada push ke repository
2. **✅ Success Notification** - Ketika Vercel deployment berhasil
3. **❌ Failed Notification** - Ketika Vercel deployment gagal

## 🔧 Setup

### 1. Buat Discord Webhook

1. Buka Discord channel yang ingin menerima notifikasi
2. Klik Settings (⚙️) → Integrations → Webhooks
3. Klik "New Webhook" atau edit webhook yang sudah ada
4. Copy Webhook URL
5. Simpan untuk digunakan di langkah berikutnya

### 2. Dapatkan Vercel Credentials

#### Vercel Token

1. Buka [Vercel Account Settings](https://vercel.com/account/tokens)
2. Klik "Create Token"
3. Beri nama (misalnya: "GitHub Actions")
4. Copy token yang dihasilkan

#### Vercel Project ID dan Org ID

1. Buka project Anda di Vercel
2. Klik Settings
3. Scroll ke bawah, Anda akan menemukan:
   - **Project ID** di bagian "General"
   - **Team ID** atau **Org ID** (jika menggunakan team)

Atau gunakan Vercel CLI:

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Link project (jalankan di root project)
vercel link

# Dapatkan Project ID dan Org ID
vercel project ls
```

### 3. Tambahkan Secrets di GitHub

1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

| Secret Name           | Deskripsi                        | Contoh                                 |
| --------------------- | -------------------------------- | -------------------------------------- |
| `DISCORD_WEBHOOK_URL` | Webhook URL dari Discord         | `https://discord.com/api/webhooks/...` |
| `VERCEL_TOKEN`        | Token API dari Vercel            | `xxxxxxxxxxxxxxxxxxxxxxxx`             |
| `VERCEL_PROJECT_ID`   | Project ID dari Vercel           | `prj_xxxxxxxxxxxxx`                    |
| `VERCEL_ORG_ID`       | Organization/Team ID dari Vercel | `team_xxxxxxxxxxxxx`                   |

## 📋 Workflow Files

### `discord-push-notification.yml`

Workflow ini akan trigger pada setiap push ke semua branch dan mengirim notifikasi dengan informasi:

- Repository dan branch
- Jumlah commits
- Commit message terbaru
- Author
- Link ke commit

### `discord-vercel-deployment.yml`

Workflow ini akan:

1. Menunggu Vercel deployment (maksimal 10 menit)
2. Mengecek status deployment melalui Vercel API
3. Mengirim notifikasi success atau failed berdasarkan status deployment

## 🎨 Format Notifikasi

### Push Notification (Biru)

```
📝 New Push to main
Repository: username/repo
Branch: main
Commits: 1

Latest Commit: Update README
Author: John Doe
Commit Hash: abc1234
```

### Success Notification (Hijau)

```
✅ Deployment Successful
Repository: username/repo
Branch: main

Deployment URL: https://your-app.vercel.app
Commit: abc1234 - Update README
Author: John Doe
Status: 🟢 Ready
```

### Failed Notification (Merah)

```
❌ Deployment Failed
Repository: username/repo
Branch: main

Error: Build failed with exit code 1
Commit: abc1234 - Update README
Author: John Doe
Status: 🔴 Failed
```

## 🧪 Testing

### Test Push Notification

```bash
# Buat commit dan push
git add .
git commit -m "Test push notification"
git push
```

Cek Discord channel, seharusnya muncul notifikasi push.

### Test Deployment Notifications

1. **Test Success**: Push commit yang valid

```bash
git add .
git commit -m "Test successful deployment"
git push
```

2. **Test Failed**: Push commit dengan error (misalnya syntax error di code)

```bash
# Buat error di code
echo "invalid syntax" >> src/index.ts
git add .
git commit -m "Test failed deployment"
git push
```

## 🔍 Troubleshooting

### Notifikasi tidak muncul

- Pastikan semua secrets sudah ditambahkan dengan benar
- Cek GitHub Actions logs untuk error
- Verifikasi Discord Webhook URL masih valid

### Deployment status tidak terdeteksi

- Pastikan `VERCEL_PROJECT_ID` dan `VERCEL_ORG_ID` benar
- Pastikan `VERCEL_TOKEN` memiliki permission yang cukup
- Cek apakah Vercel deployment memang ter-trigger

### Timeout pada deployment check

- Default timeout adalah 10 menit
- Jika deployment Anda lebih lama, edit `MAX_WAIT` di workflow file

## 📝 Customization

### Mengubah branch yang dimonitor

Edit file `discord-vercel-deployment.yml`:

```yaml
on:
  push:
    branches:
      - main # Hanya monitor branch main
      - production # Tambahkan branch lain jika perlu
```

### Mengubah timeout deployment check

Edit bagian `MAX_WAIT` di `discord-vercel-deployment.yml`:

```bash
# Ubah dari 600 (10 menit) ke nilai lain (dalam detik)
MAX_WAIT=1200  # 20 menit
```

### Mengubah warna embed Discord

Edit nilai `color` di workflow files:

- Biru: `3447003`
- Hijau: `3066993`
- Merah: `15158332`
- Custom: Gunakan decimal color code

## 🔗 Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
